import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, toggleAdmin, changeUserPassword, } from '../controllers/userController.js';
import authenticateToken from '../middleware/auth.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import isSelfOrAdmin from '../middleware/isSelfOrAdmin.js';

const router = express.Router();

router.get('/', authenticateToken, verifyAdmin, getAllUsers);
router.patch('/:id/toggle-admin', authenticateToken, verifyAdmin, toggleAdmin);
router.post('/:id/change-password', authenticateToken, verifyAdmin, changeUserPassword);

router.get('/:id', authenticateToken, isSelfOrAdmin, getUserById);
router.put('/:id', authenticateToken, isSelfOrAdmin, updateUser);
router.delete('/:id', authenticateToken, isSelfOrAdmin, deleteUser);

export default router;