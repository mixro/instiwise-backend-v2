import express from 'express'
import { googleLimiter, validateLogin, validatePassword, validateRegister, validateRequest, validateUsername } from '../middleware/validate.js';
import { adminLogin, changeSelfPassword, getMe, googleLogin, login, logout, refreshToken, register, setupUsername } from '../controllers/authController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateRegister, validateRequest, register);
router.post('/login', validateLogin, validateRequest, login);
router.post('/google', googleLimiter, googleLogin);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.post('/refresh', refreshToken);
router.post('/setup-username', authenticateToken, validateUsername, validateRequest, setupUsername);
router.post('/me/change-password', authenticateToken, validatePassword, validateRequest, changeSelfPassword);

router.post('/admin/login', validateLogin, adminLogin);

export default router;