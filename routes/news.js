import express from 'express';
import { createNews, updateNews, deleteNews, getAllNews, getNews, likeNews, dislikeNews } from '../controllers/newsController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createNews);
router.get('/', authenticateToken, getAllNews);
router.get('/:id', authenticateToken, getNews);
router.put('/:id', authenticateToken, updateNews);
router.put('/:id/like', authenticateToken, likeNews);
router.put('/:id/dislike', authenticateToken, dislikeNews);
router.delete('/:id', authenticateToken, deleteNews);

export default router;