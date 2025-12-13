// routes/dashboard.js
import express from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import authenticateToken from '../middleware/auth.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

router.get('/', authenticateToken, verifyAdmin, getDashboardMetrics);

export default router;