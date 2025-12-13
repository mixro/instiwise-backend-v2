import express from 'express';
import {
  createDemoRequest,
  getAllDemoRequests,
  getDemoRequestById,
  updateDemoRequest,
  deleteDemoRequest,
  getDemoRequestAnalytics
} from '../controllers/demoRequestController.js';
import authenticateToken from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';
import verifyAdmin from '../middleware/verifyAdmin.js';

// Rate limit public form submissions
const demoRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: { success: false, message: 'Too many requests. Try again in 1 hour.' }
});

const router = express.Router();

// PUBLIC: Landing page form
router.post('/', demoRequestLimiter, createDemoRequest);

// ADMIN ONLY
router.get('/', authenticateToken, verifyAdmin, getAllDemoRequests);
router.get('/:id', authenticateToken, verifyAdmin, getDemoRequestById);
router.patch('/:id', authenticateToken, verifyAdmin, updateDemoRequest);
router.delete('/:id', authenticateToken, verifyAdmin, deleteDemoRequest);
router.get('/analytics/timely', authenticateToken, verifyAdmin, getDemoRequestAnalytics);

export default router;