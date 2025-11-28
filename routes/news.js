import express from 'express';
import { createNews, updateNews, deleteNews, getAllNews, getNews, likeNews, dislikeNews, viewNews, getTimelyNewsAnalytics } from '../controllers/newsController.js';
import authenticateToken from '../middleware/auth.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

router.post('/', authenticateToken, createNews);
router.get('/', authenticateToken, getAllNews);
router.get('/:id', authenticateToken, getNews);
router.put('/:id', authenticateToken, updateNews);
router.put('/:id/like', authenticateToken, likeNews);
router.put('/:id/dislike', authenticateToken, dislikeNews);
router.delete('/:id', authenticateToken, verifyAdmin, deleteNews);
router.put('/:id/view', authenticateToken, viewNews);
router.get('/stats/timely', authenticateToken, verifyAdmin, getTimelyNewsAnalytics);

export default router;