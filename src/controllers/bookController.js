const pool = require('../db');
const libraryService = require('../services/libraryService');

exports.createBook = async (req, res, next) => {
  try {
    const { isbn, title, author, category, status, total_copies, available_copies } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO books (isbn, title, author, category, status, total_copies, available_copies)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        isbn,
        title,
        author,
        category || null,
        status || 'available',
        total_copies,
        available_copies ?? total_copies
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getBooks = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM books ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isbn, title, author, category, status, total_copies, available_copies } = req.body;

    const { rows } = await pool.query(
      `UPDATE books
       SET isbn = COALESCE($2, isbn),
           title = COALESCE($3, title),
           author = COALESCE($4, author),
           category = COALESCE($5, category),
           total_copies = COALESCE($7, total_copies),
           available_copies = COALESCE($8, available_copies)
       WHERE id = $1
       RETURNING *`,
      [id, isbn, title, author, category, status, total_copies, available_copies]
    );

    // Note: Status updates are restricted in this endpoint to prevent bypassing state logic.
    // Use specific endpoints for strict state transitions (borrow, return, reserve, maintenance).

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM books WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.getAvailableBooks = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM books
       WHERE available_copies > 0
         AND status = 'available'
       ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.reserveBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { member_id } = req.body;

    const reservation = await libraryService.reserveBook({ memberId: member_id, bookId: id });
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
};
