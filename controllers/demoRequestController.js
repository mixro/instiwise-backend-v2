// controllers/demoRequestController.js
import DemoRequest from '../models/DemoRequest.js';
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns';

// CREATE - Public (Landing Page)
export const createDemoRequest = async (req, res) => {
  const {
    fullName,
    email,
    instituteName,
    phone,
    designation,
    studentStrength,
    message
  } = req.body;

  try {
    // Basic validation
    if (!fullName || !email || !instituteName) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email, and Institute Name are required'
      });
    }

    // Prevent spam duplicates (same email + institute in last 24h)
    const recent = await DemoRequest.findOne({
      email,
      instituteName,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recent) {
      return res.status(429).json({
        success: false,
        message: 'You already requested a demo recently. We’ll contact you soon!'
      });
    }

    const demoRequest = await DemoRequest.create({
      fullName,
      email,
      instituteName,
      phone,
      designation,
      studentStrength,
      message: message || ""
    });

    res.status(201).json({
      success: true,
      data: demoRequest,
      message: 'Demo request submitted! We’ll contact you within 24 hours.'
    });
  } catch (error) {
    console.error('Demo request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ALL (Admin Only)
export const getAllDemoRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};

    const requests = await DemoRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('respondedBy', 'username email');

    const total = await DemoRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        currentPage: +page,
        totalPages: Math.ceil(total / limit),
        totalRequests: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ONE (Admin)
export const getDemoRequestById = async (req, res) => {
  try {
    const request = await DemoRequest.findById(req.params.id)
      .populate('respondedBy', 'username');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE STATUS (Admin Only)
export const updateDemoRequest = async (req, res) => {
  const { status, respondedBy } = req.body;

  try {
    const request = await DemoRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (status) request.status = status;
    if (respondedBy) request.respondedBy = respondedBy;

    await request.save();

    res.json({
      success: true,
      data: request,
      message: 'Request updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE (Admin Only)
export const deleteDemoRequest = async (req, res) => {
  try {
    const request = await DemoRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// TIMELY METRICS
export const getDemoRequestAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Helper: Count by Status in Range
    const getCountsInRange = async (startDate, endDate = now) => {
      const pipeline = [
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }}
      ];
      const result = await DemoRequest.aggregate(pipeline);
      
      return {
        pending: result.find(r => r._id === 'pending')?.count || 0,
        contacted: result.find(r => r._id === 'contacted')?.count || 0,
        scheduled: result.find(r => r._id === 'scheduled')?.count || 0,
        completed: result.find(r => r._id === 'completed')?.count || 0,
        rejected: result.find(r => r._id === 'rejected')?.count || 0,
        total: result.reduce((sum, r) => sum + r.count, 0)
      };
    };

    // === ALL-TIME GROSS METRICS ===
    const grossPipeline = [
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ];
    const grossResult = await DemoRequest.aggregate(grossPipeline);

    const gross = {
      totalRequests: grossResult.reduce((sum, r) => sum + r.count, 0),
      pending: grossResult.find(r => r._id === 'pending')?.count || 0,
      contacted: grossResult.find(r => r._id === 'contacted')?.count || 0,
      scheduled: grossResult.find(r => r._id === 'scheduled')?.count || 0,
      completed: grossResult.find(r => r._id === 'completed')?.count || 0,
      rejected: grossResult.find(r => r._id === 'rejected')?.count || 0
    };

    // === PERIODIC STATS ===
    const today = await getCountsInRange(startOfDay(now));
    const yesterday = await getCountsInRange(startOfDay(subDays(now, 1)), startOfDay(now));

    const thisWeek = await getCountsInRange(startOfWeek(now));
    const lastWeek = await getCountsInRange(startOfWeek(subWeeks(now, 1)), startOfWeek(now));

    const thisMonth = await getCountsInRange(startOfMonth(now));
    const lastMonth = await getCountsInRange(startOfMonth(subMonths(now, 1)), startOfMonth(now));

    // Helper: % change
    const percentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    res.json({
      success: true,
      data: {
        grossMetrics: gross,
        summary: {
          today: {
            ...today,
            growth: percentChange(today.total, yesterday.total)
          },
          thisWeek: {
            ...thisWeek,
            growth: percentChange(thisWeek.total, lastWeek.total)
          },
          thisMonth: {
            ...thisMonth,
            growth: percentChange(thisMonth.total, lastMonth.total)
          }
        },
        generatedAt: now.toISOString()
      },
      message: 'Demo request analytics fetched successfully'
    });
  } catch (error) {
    console.error('getDemoRequestAnalytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'server_error'
    });
  }
};