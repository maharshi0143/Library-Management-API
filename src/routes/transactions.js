const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

// POST /transactions/borrow
router.post('/borrow', transactionController.borrow);

// POST /transactions/:id/return
router.post('/:id/return', transactionController.returnBook);

// GET /transactions/overdue
router.get('/overdue', transactionController.getOverdue);

module.exports = router;
