const express = require('express');
const fineController = require('../controllers/fineController');

const router = express.Router();

// GET /fines  (helper)
router.get('/', fineController.getFines);

// GET /fines/member/:memberId  (helper)
router.get('/member/:memberId', fineController.getUnpaidFinesForMember);

// POST /fines/:id/pay
router.post('/:id/pay', fineController.markFinePaid);

module.exports = router;
