// controllers/dashboardController.js
import New from '../models/New.js';
import Project from '../models/Project.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import DemoRequest from '../models/DemoRequest.js';
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths 
} from 'date-fns';

export const getDashboardMetrics = async (req, res) => {
  try {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Helper: Count in range
    const countInRange = async (Model, startDate, endDate) => {
      return await Model.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
    };

    // Helper: % change
    const percentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // === TOTALS + GROWTH ===
    const totalNews = await New.countDocuments();
    const thisMonthNews = await countInRange(New, thisMonthStart, thisMonthEnd);
    const lastMonthNews = await countInRange(New, lastMonthStart, lastMonthEnd);
    const newsGrowth = percentChange(thisMonthNews, lastMonthNews);

    const totalProjects = await Project.countDocuments();
    const thisMonthProjects = await countInRange(Project, thisMonthStart, thisMonthEnd);
    const lastMonthProjects = await countInRange(Project, lastMonthStart, lastMonthEnd);
    const projectsGrowth = percentChange(thisMonthProjects, lastMonthProjects);

    const totalEvents = await Event.countDocuments();
    const thisMonthEvents = await countInRange(Event, thisMonthStart, thisMonthEnd);
    const lastMonthEvents = await countInRange(Event, lastMonthStart, lastMonthEnd);
    const eventsGrowth = percentChange(thisMonthEvents, lastMonthEvents);

    const totalUsers = await User.countDocuments();
    const thisMonthUsers = await countInRange(User, thisMonthStart, thisMonthEnd);
    const lastMonthUsers = await countInRange(User, lastMonthStart, lastMonthEnd);
    const usersGrowth = percentChange(thisMonthUsers, lastMonthUsers);

    const totalDemoRequests = await DemoRequest.countDocuments();
    const thisMonthDemoRequests = await countInRange(DemoRequest, thisMonthStart, thisMonthEnd);
    const lastMonthDemoRequests = await countInRange(DemoRequest, lastMonthStart, lastMonthEnd);
    const demoRequestsGrowth = percentChange(thisMonthDemoRequests, lastMonthDemoRequests);

    // === RECENT ITEMS ===
    const recentNews = await New.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('header img createdAt');

    const upcomingEvents = await Event.find({
      dateTime: { $gt: now }
    })
      .sort({ dateTime: 1 })
      .limit(5)
      .select('header date');

    const newUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username img createdAt');

    res.json({
      success: true,
      data: {
        totals: {
          news: { total: totalNews, growth: newsGrowth },
          projects: { total: totalProjects, growth: projectsGrowth },
          events: { total: totalEvents, growth: eventsGrowth },
          users: { total: totalUsers, growth: usersGrowth },
          demoRequests: { total: totalDemoRequests, growth: demoRequestsGrowth }
        },
        recent: {
          news: recentNews.map(n => ({
            header: n.header,
            img: n.img,
            createdAt: n.createdAt
          })),
          upcomingEvents: upcomingEvents.map(e => ({
            header: e.header,
            date: e.date,
          })),
          newUsers: newUsers.map(u => ({
            username: u.username,
            img: u.img,
            createdAt: u.createdAt
          }))
        },
        generatedAt: now.toISOString()
      },
      message: 'Dashboard metrics fetched successfully'
    });
  } catch (error) {
    console.error('getDashboardMetrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'server_error'
    });
  }
};