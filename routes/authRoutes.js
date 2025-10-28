import express from 'express'
import { validateLogin, validateRegister, validateRequest, validateUsername } from '../middleware/validate.js';
import { getMe, login, logout, refreshToken, register, setupUsername } from '../controllers/authController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateRegister, validateRequest, register);
router.post('/login', validateLogin, validateRequest, login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.post('/refresh', refreshToken);
router.post('/setup-username', authenticateToken, validateUsername, validateRequest, setupUsername);

export default router;