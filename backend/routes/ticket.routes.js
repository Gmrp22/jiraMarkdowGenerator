const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const ticketController = require('../controllers/ticket.controller');

const router = Router();

router.get('/', authMiddleware, ticketController.getAll);
router.get('/search', authMiddleware, ticketController.search);
router.get('/:id', authMiddleware, ticketController.getById);

module.exports = router;
