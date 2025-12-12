// controllers/demoRequestController.js
import DemoRequest from '../models/DemoRequest.js';

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