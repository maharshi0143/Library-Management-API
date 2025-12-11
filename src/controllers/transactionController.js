const {
  borrowBook,
  returnBook,
  listOverdueTransactions
} = require('../services/libraryService');

exports.borrow = async (req, res, next) => {
  try {
    const { memberId, bookId } = req.body;
    const tx = await borrowBook({ memberId, bookId });
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await returnBook(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getOverdue = async (req, res, next) => {
  try {
    const rows = await listOverdueTransactions();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
