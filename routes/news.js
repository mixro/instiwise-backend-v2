import express from 'express';
import { createNews, getUserNews, updateNews, deleteNews } from '../controllers/newsController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createNews);
router.get('/', authenticateToken, getUserNews);
router.put('/:id', authenticateToken, updateNews);
router.delete('/:id', authenticateToken, deleteNews);

export default router;