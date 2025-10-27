import express from 'express';
import { createProject, getUserProjects, updateProject, deleteProject, getAllProjects, getProject, likeProject } from '../controllers/projectController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createProject);
router.get('/', authenticateToken, getAllProjects);
router.get('/:id', authenticateToken, getProject);
router.get('/user/:userId', authenticateToken, getUserProjects);
router.put('/:id', authenticateToken, updateProject);
router.put('/:id/like', authenticateToken, likeProject);
router.delete('/:id', authenticateToken, deleteProject);

export default router;