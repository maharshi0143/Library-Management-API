const express = require('express');
const memberController = require('../controllers/memberController');

const router = express.Router();

// POST /api/members
router.post('/', memberController.createMember);

// GET /api/members
router.get('/', memberController.getMembers);

// GET /api/members/:id
router.get('/:id', memberController.getMemberById);

// PUT /api/members/:id
router.put('/:id', memberController.updateMember);

// DELETE /api/members/:id
router.delete('/:id', memberController.deleteMember);

// GET /api/members/:id/borrowed
router.get('/:id/borrowed', memberController.getBorrowedBooksForMember);

module.exports = router;
