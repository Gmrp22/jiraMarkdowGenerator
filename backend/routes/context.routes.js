const { Router } = require('express');
const { z } = require('zod');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const contextController = require('../controllers/context.controller');

const router = Router();

const contextSchema = z.object({
  ticketIds: z.array(z.string()).min(1, 'At least one ticket ID is required'),
});

router.post('/', authMiddleware, validate(contextSchema), contextController.generate);

module.exports = router;
