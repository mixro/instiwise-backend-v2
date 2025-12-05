import Event from '../models/Event.js';
import { classifyEvent } from '../utils/dateTimeUtils.js';
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns';


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

// Get Upcoming Events
export const getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();

    const upcoming = await Event.find({
      dateTime: { $gt: now } // Truly future events
    })
      .sort({ dateTime: 1 })    // Sort by actual datetime
      .limit(4)

    const enriched = upcoming.map(event => ({
      ...event.toObject(),
      isFavorited: req.user ? event.favorites.includes(req.user.id.toString()) : false,
      favoriteCount: event.favorites.length
    }));

    res.json({
      success: true,
      data: enriched,
      count: enriched.length,
      message: '4 most recent upcoming events'
    });
  } catch (error) {
    console.error('getUpcomingEvents error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// Get Ongoing Events
export const getOngoingEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ start: 1 });
    const ongoing = events
      .filter(e => classifyEvent(e) === 'ongoing')
      .map(e => ({ ...e.toObject(), status: 'ongoing' }));

    res.json({
      success: true,
      data: ongoing,
      count: ongoing.length,
      message: 'Ongoing events fetched',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// Get Past Events
export const getPastEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1, end: -1 });
    const past = events
      .filter(e => classifyEvent(e) === 'past')
      .map(e => ({ ...e.toObject(), status: 'past' }));

    res.json({
      success: true,
      data: past,
      count: past.length,
      message: 'Past events fetched',
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
      { _id: id },
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
    const event = await Event.findOneAndDelete({ _id: id });
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

// Toggle Favorite (Any Authenticated User)
export const toggleFavorite = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id.toString();

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isFavorited = event.favorites.includes(userId);
    let updatedFavorites;

    if (isFavorited) {
      updatedFavorites = event.favorites.filter(uid => uid !== userId);
    } else {
      updatedFavorites = [...event.favorites, userId];
    }

    event.favorites = updatedFavorites;
    await event.save();

    res.json({
      success: true,
      data: {
        isFavorited: !isFavorited,
        favoriteCount: updatedFavorites.length
      },
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get User's Personal Favorite Events
export const getFavoriteEvents = async (req, res) => {
  const userId = req.user.id.toString();

  try {
    const events = await Event.find({ favorites: userId })
      .sort({ date: 1, start: 1 });

    const enriched = events.map(e => ({
      ...e.toObject(),
      isFavorited: true,
      favoriteCount: e.favorites.length
    }));

    res.json({
      success: true,
      data: enriched,
      count: enriched.length,
      message: 'Your favorite events'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getEventTimelyAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Helper: Stats in a date range
    const getStatsInRange = async (startDate, endDate = now) => {
      const events = await Event.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).select('favorites createdAt');

      const count = events.length;
      const totalFavorites = events.reduce((sum, e) => sum + e.favorites.length, 0);

      return { count, totalFavorites };
    };

    // === ALL-TIME GROSS METRICS ===
    const allEvents = await Event.find().select('favorites').lean();
    const gross = {
      totalEvents: allEvents.length,
      totalFavorites: allEvents.reduce((sum, e) => sum + e.favorites.length, 0),
      averageFavoritesPerEvent: allEvents.length > 0
        ? Math.round(allEvents.reduce((sum, e) => sum + e.favorites.length, 0) / allEvents.length)
        : 0
    };

    // === PERIODIC STATS ===
    const today = await getStatsInRange(startOfDay(now));
    const yesterday = await getStatsInRange(startOfDay(subDays(now, 1)), startOfDay(now));

    const thisWeek = await getStatsInRange(startOfWeek(now));
    const lastWeek = await getStatsInRange(startOfWeek(subWeeks(now, 1)), startOfWeek(now));

    const thisMonth = await getStatsInRange(startOfMonth(now));
    const lastMonth = await getStatsInRange(startOfMonth(subMonths(now, 1)), startOfMonth(now));

    // Helper: % change
    const percentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    res.json({
      success: true,
      data: {
        grossMetrics: {
          totalEvents: gross.totalEvents,
          totalFavorites: gross.totalFavorites,
          averageFavoritesPerEvent: gross.averageFavoritesPerEvent
        },
        summary: {
          today: {
            eventsCount: today.count,
            favorites: today.totalFavorites,
            eventsGrowth: percentChange(today.count, yesterday.count),
            favoritesGrowth: percentChange(today.totalFavorites, yesterday.totalFavorites)
          },
          thisWeek: {
            eventsCount: thisWeek.count,
            favorites: thisWeek.totalFavorites,
            eventsGrowth: percentChange(thisWeek.count, lastWeek.count),
            favoritesGrowth: percentChange(thisWeek.totalFavorites, lastWeek.totalFavorites)
          },
          thisMonth: {
            eventsCount: thisMonth.count,
            favorites: thisMonth.totalFavorites,
            eventsGrowth: percentChange(thisMonth.count, lastMonth.count),
            favoritesGrowth: percentChange(thisMonth.totalFavorites, lastMonth.totalFavorites)
          }
        },
        generatedAt: now.toISOString()
      },
      message: 'Event analytics fetched successfully'
    });
  } catch (error) {
    console.error('getEventTimelyAnalytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'server_error'
    });
  }
};