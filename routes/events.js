import express from 'express';
import { createEvent, updateEvent, deleteEvent, getAllEvents, toggleFavorite, getFavoriteEvents, getEvent, getUpcomingEvents, getOngoingEvents, getPastEvents } from '../controllers/eventController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createEvent);
router.get('/', authenticateToken, getAllEvents);
router.get('/:id/event', authenticateToken, getEvent);
router.get('/upcoming', authenticateToken, getUpcomingEvents);        
router.get('/ongoing', authenticateToken, getOngoingEvents);
router.get('/past', authenticateToken, getPastEvents);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);
router.patch('/:id/favorite', authenticateToken, toggleFavorite);
router.get('/:id/favorites', authenticateToken, getFavoriteEvents);

export default router;