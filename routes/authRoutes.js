import express from 'express'
import { validateLogin, validateRegister, validateRequest } from '../middleware/validate.js';
import { getMe, login, logout, register } from '../controllers/authController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateRegister, validateRequest, register);
router.post('/login', validateLogin, validateRequest, login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;