const pool = require('../db');
const { ApiError } = require('../utils/errorHandler');

function normalizeStatus(rawStatus) {
  if (rawStatus == null) return null; 
  if (typeof rawStatus !== 'string') {
    throw new ApiError(400, 'Status must be a string');
  }

  const value = rawStatus.toLowerCase(); 
  const allowed = ['active', 'suspended'];

  if (!allowed.includes(value)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${allowed.join(', ')}`);
  }

  return value;
}

exports.createMember = async (req, res, next) => {
  try {
    const { name, email, membership_number, status } = req.body;

    const normalizedStatus = status ? normalizeStatus(status) : 'active';

    const { rows } = await pool.query(
      `INSERT INTO members (name, email, membership_number, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, membership_number, normalizedStatus]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getMembers = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM members ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM members WHERE id = $1', [id]);
    if (rows.length === 0) throw new ApiError(404, 'Member not found');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { name, email, membership_number, status } = req.body;

    const normalizedStatus = normalizeStatus(status);

    const { rows } = await pool.query(
      `UPDATE members
       SET name = COALESCE($2, name),
           email = COALESCE($3, email),
           membership_number = COALESCE($4, membership_number),
           status = COALESCE($5, status)
       WHERE id = $1
       RETURNING *`,
      [id, name, email, membership_number, normalizedStatus]
    );

    if (rows.length === 0) throw new ApiError(404, 'Member not found');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM members WHERE id = $1', [id]);

    if (rowCount === 0) throw new ApiError(404, 'Member not found');

    res.status(200).json({ message: `Member ${id} deleted` });
  } catch (err) {
    next(err);
  }
};

exports.getBorrowedBooksForMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT t.*, b.title, b.author, b.isbn
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       WHERE t.member_id = $1
         AND t.returned_at IS NULL
         AND t.status IN ('active', 'overdue')
       ORDER BY t.borrowed_at DESC`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};
