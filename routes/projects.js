import express from 'express';
import { createProject, getUserProjects, updateProject, deleteProject, getAllProjects, getProject, likeProject, getMyProjects, getProjectTimelyAnalytics } from '../controllers/projectController.js';
import authenticateToken from '../middleware/auth.js';
import ownsProject from '../middleware/ownsProject.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

router.post('/', authenticateToken, createProject);
router.get('/', authenticateToken, getAllProjects);
router.get('/:id', authenticateToken, getProject);
router.get('/my/projects', authenticateToken, getMyProjects);
router.get('/user/:userId', authenticateToken, getUserProjects);
router.put('/:id/like', authenticateToken, likeProject);
router.put('/:id', authenticateToken, ownsProject, updateProject);
router.delete('/:id', authenticateToken, ownsProject, deleteProject);

router.get('/analytics/timely', authenticateToken, verifyAdmin, getProjectTimelyAnalytics);

export default router;