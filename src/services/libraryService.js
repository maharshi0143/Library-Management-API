const pool = require('../db');
const { ApiError } = require('../utils/errorHandler');
const { addDays, diffInDays } = require('../utils/dateUtils');

const DAILY_FINE = 0.5;   
const LOAN_DAYS = 14;    

async function refreshOverdueTransactions(client) {
  const now = new Date();

  const { rows } = await client.query(
    `SELECT id, member_id
     FROM transactions
     WHERE status = 'active'
       AND returned_at IS NULL
       AND due_date < $1
     FOR UPDATE`,
    [now]
  );

  if (rows.length === 0) return;

  const ids = rows.map(r => r.id);
  const memberIds = [...new Set(rows.map(r => r.member_id))];

  await client.query(
    `UPDATE transactions
     SET status = 'overdue'
     WHERE id = ANY($1::int[])`,
    [ids]
  );

  for (const memberId of memberIds) {
    await recomputeMemberStatus(client, memberId);
  }
}

async function recomputeMemberStatus(client, memberId) {
  const { rows: overdueRows } = await client.query(
    `SELECT COUNT(*) AS count
     FROM transactions
     WHERE member_id = $1
       AND status = 'overdue'
       AND returned_at IS NULL`,
    [memberId]
  );
  const overdueCount = parseInt(overdueRows[0].count, 10);

  const { rows: fineRows } = await client.query(
    `SELECT COUNT(*) AS count
     FROM fines
     WHERE member_id = $1
       AND paid_at IS NULL`,
    [memberId]
  );
  const unpaidFineCount = parseInt(fineRows[0].count, 10);

  let newStatus = 'active';
  if (overdueCount >= 3 || unpaidFineCount > 0) {
    newStatus = 'suspended';
  }

  await client.query(
    `UPDATE members
     SET status = $2
     WHERE id = $1`,
    [memberId, newStatus]
  );
}

async function borrowBook({ memberId, bookId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await refreshOverdueTransactions(client);

    // Lock member row
    const { rows: memberRows } = await client.query(
      'SELECT * FROM members WHERE id = $1 FOR UPDATE',
      [memberId]
    );
    if (memberRows.length === 0) {
      throw new ApiError(404, 'Member not found');
    }
    const member = memberRows[0];

    if (member.status === 'suspended') {
      throw new ApiError(400, 'Member is suspended and cannot borrow books');
    }

    // Block if unpaid fines
    const { rows: fineRows } = await client.query(
      'SELECT COUNT(*) AS count FROM fines WHERE member_id = $1 AND paid_at IS NULL',
      [memberId]
    );
    if (parseInt(fineRows[0].count, 10) > 0) {
      throw new ApiError(400, 'Member has unpaid fines and cannot borrow books');
    }

    // Max 3 active/overdue
    const { rows: activeRows } = await client.query(
      `SELECT COUNT(*) AS count
       FROM transactions
       WHERE member_id = $1
         AND returned_at IS NULL
         AND status IN ('active', 'overdue')`,
      [memberId]
    );
    if (parseInt(activeRows[0].count, 10) >= 3) {
      throw new ApiError(400, 'Member has reached the borrowing limit of 3 books');
    }

    // Lock book row
    const { rows: bookRows } = await client.query(
      'SELECT * FROM books WHERE id = $1 FOR UPDATE',
      [bookId]
    );
    if (bookRows.length === 0) {
      throw new ApiError(404, 'Book not found');
    }
    const book = bookRows[0];

    if (book.status === 'maintenance') {
      throw new ApiError(400, 'Book is under maintenance and cannot be borrowed');
    }

    if (book.available_copies <= 0) {
      throw new ApiError(400, 'No available copies to borrow');
    }

    const borrowedAt = new Date();
    const dueDate = addDays(borrowedAt, LOAN_DAYS);

    const { rows: txRows } = await client.query(
      `INSERT INTO transactions (book_id, member_id, borrowed_at, due_date, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [bookId, memberId, borrowedAt, dueDate]
    );
    const transaction = txRows[0];

    const newAvailable = book.available_copies - 1;
    const newStatus = newAvailable === 0 ? 'borrowed' : 'available';

    await client.query(
      `UPDATE books
       SET available_copies = $2,
           status = $3
       WHERE id = $1`,
      [bookId, newAvailable, newStatus]
    );

    await client.query('COMMIT');
    return transaction;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function returnBook(transactionId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await refreshOverdueTransactions(client);

    const { rows: txRows } = await client.query(
      `SELECT * FROM transactions WHERE id = $1 FOR UPDATE`,
      [transactionId]
    );
    if (txRows.length === 0) {
      throw new ApiError(404, 'Transaction not found');
    }
    const tx = txRows[0];

    if (tx.returned_at) {
      throw new ApiError(400, 'Book is already returned');
    }

    const { rows: bookRows } = await client.query(
      'SELECT * FROM books WHERE id = $1 FOR UPDATE',
      [tx.book_id]
    );
    const book = bookRows[0];

    const { rows: memberRows } = await client.query(
      'SELECT * FROM members WHERE id = $1 FOR UPDATE',
      [tx.member_id]
    );
    const member = memberRows[0];

    const now = new Date();
    let fine = null;

    if (now > tx.due_date) {
      const daysOverdue = diffInDays(now, tx.due_date);
      if (daysOverdue > 0) {
        const amount = daysOverdue * DAILY_FINE;

        const { rows: fineRows } = await client.query(
          `INSERT INTO fines (member_id, transaction_id, amount)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [member.id, tx.id, amount]
        );
        fine = fineRows[0];
      }
    }

    await client.query(
      `UPDATE transactions
       SET returned_at = $2,
           status = 'returned'
       WHERE id = $1`,
      [tx.id, now]
    );

    const newAvailable = book.available_copies + 1;
    const newStatus =
      book.status === 'maintenance' ? 'maintenance' : 'available';

    await client.query(
      `UPDATE books
       SET available_copies = $2,
           status = $3
       WHERE id = $1`,
      [book.id, newAvailable, newStatus]
    );

    await recomputeMemberStatus(client, member.id);

    await client.query('COMMIT');

    return { transactionId: tx.id, fine };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listOverdueTransactions() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await refreshOverdueTransactions(client);

    const { rows } = await client.query(
      `SELECT * FROM transactions
       WHERE status = 'overdue'
         AND returned_at IS NULL`
    );

    await client.query('COMMIT');
    return rows;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function payFine(fineId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: fineRows } = await client.query(
      `SELECT * FROM fines WHERE id = $1 FOR UPDATE`,
      [fineId]
    );
    if (fineRows.length === 0) {
      throw new ApiError(404, 'Fine not found');
    }
    const fine = fineRows[0];

    if (fine.paid_at) {
      throw new ApiError(400, 'Fine already paid');
    }

    const paidAt = new Date();

    await client.query(
      `UPDATE fines
       SET paid_at = $2
       WHERE id = $1`,
      [fineId, paidAt]
    );

    await recomputeMemberStatus(client, fine.member_id);

    await client.query('COMMIT');

    return { id: fineId, paid_at: paidAt };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  borrowBook,
  returnBook,
  listOverdueTransactions,
  payFine
};
