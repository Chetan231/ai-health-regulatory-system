import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

export default router;
