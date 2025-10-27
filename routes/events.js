import express from 'express';
import { createEvent, getUserEvents, updateEvent, deleteEvent } from '../controllers/eventController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createEvent);
router.get('/', authenticateToken, getUserEvents);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

export default router;