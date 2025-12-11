const pool = require('../db');
const { payFine } = require('../services/libraryService');

exports.markFinePaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await payFine(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Optional helpers – not required by spec but useful for testing

exports.getFines = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM fines ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getUnpaidFinesForMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM fines
       WHERE member_id = $1
         AND paid_at IS NULL
       ORDER BY id`,
      [memberId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
