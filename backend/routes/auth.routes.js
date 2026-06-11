const { Router } = require('express');
const { z } = require('zod');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const validate = require('../middlewares/validate.middleware');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const router = Router();

router.post('/register', authLimiter, validate(credentialsSchema), authController.register);
router.post('/login', authLimiter, validate(credentialsSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
