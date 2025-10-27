import Event from '../models/Event.js';

export const createEvent = async (req, res) => {
  const { header, img, desc } = req.body;
  const userId = req.user.id;

  try {
    const event = new Event({
      userId,
      header,
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
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const getUserEvents = async (req, res) => {
  const userId = req.user.id;

  try {
    const events = await Event.find({ userId });
    res.json({
      success: true,
      data: events,
      message: 'Events fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const event = await Event.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found', error: 'not_found' });
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

export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found', error: 'not_found' });
    }
    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};