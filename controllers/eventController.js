import Event from '../models/Event.js';

// Create Event
export const createEvent = async (req, res) => {
  const { header, location, category, date, start, end, img, desc } = req.body;
  const userId = req.user.id;

  try {
    const event = new Event({
      userId,
      header,
      location,
      category,
      date,
      start,
      end,
      img,
      desc,
    });
    await event.save();

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: events,
      message: 'Events fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// Get Event
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found', error: 'validation_error' });
    }

    res.json({
      success: true,
      data: event,
      message: 'Event fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const event = await Event.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized', error: 'not_found' });
    }

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized', error: 'not_found' });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// Toggle Favorite (New)
export const toggleFavorite = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findOne({ _id: id, userId: req.user.id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found or unauthorized', error: 'not_found' });
    }

    event.isFavorite = !event.isFavorite;
    await event.save();

    res.json({
      success: true,
      data: { isFavorite: event.isFavorite },
      message: `Event ${event.isFavorite ? 'added to' : 'removed from'} favorites`,
    });
  } catch (error) {
    console.error('Toggle Favorite Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// Get Favorite Events
export const getFavoriteEvents = async (req, res) => {
  const userId = req.params.id;

  try {
    const events = await Event.find({ userId, isFavorite: true });
    if (!events) {
      return res.status(404).json({ success: false, message: 'No favorite events', error: 'validation_error' });
    }

    res.json({
      success: true,
      data: events,
      message: 'Favorite events fetched successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};