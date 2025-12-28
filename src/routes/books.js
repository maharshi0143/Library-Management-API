const express = require('express');
const bookController = require('../controllers/bookController');

const router = express.Router();

// POST /api/books  → create a book
router.post('/', bookController.createBook);

// GET /api/books   → list all books
router.get('/', bookController.getBooks);

// GET /api/books/available → list only available books
router.get('/available', bookController.getAvailableBooks);

// GET /api/books/:id → get one book by id
router.get('/:id', bookController.getBookById);

// PUT /api/books/:id → update a book
router.put('/:id', bookController.updateBook);

// POST /api/books/:id/reserve → reserve a book
router.post('/:id/reserve', bookController.reserveBook);

// DELETE /api/books/:id → delete a book
router.delete('/:id', bookController.deleteBook);

module.exports = router;
