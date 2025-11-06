import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, toggleAdmin, changeSelfPassword, } from '../controllers/userController.js';
import authenticateToken from '../middleware/auth.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import isSelfOrAdmin from '../middleware/isSelfOrAdmin.js';
import { validatePassword, validateRequest } from '../middleware/validate.js';

const router = express.Router();

// Admin-only routes
router.get('/', authenticateToken, verifyAdmin, getAllUsers);
router.patch('/:id/toggle-admin', authenticateToken, verifyAdmin, toggleAdmin);

// Self or Admin routes
router.get('/:id', authenticateToken, isSelfOrAdmin, getUserById);
router.put('/:id', authenticateToken, isSelfOrAdmin, updateUser);
router.delete('/:id', authenticateToken, isSelfOrAdmin, deleteUser);

// New: Self Password Change
router.post('/me/change-password', authenticateToken, validatePassword, validateRequest, changeSelfPassword);

export default router;