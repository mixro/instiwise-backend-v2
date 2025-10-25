import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import redisClient from '../config/redis.js';

export const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use', error: 'auth_error' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      isAdmin: false,
      isActive: false,
    });
    await user.save();

    const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '90d' });

    res.status(201).json({
      success: true,
      data: { 
        user: {
            _id: user._id, 
            username: user.username, 
            email: user.email, 
            isAdmin: user.isAdmin,
            projectCount: user.projectsCount, 
            connectionsCount: user.connectionsCount,
            isActive: user.isActive
        }, 
        accessToken 
      },
      message: 'User created',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const setupUsername = async (req, res) => {
  const { username } = req.body;
  const userId = req.user.id; // From authenticateToken

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'auth_error' });
    }

    if (user.isActive) {
      return res.status(400).json({ success: false, message: 'Username already set', error: 'auth_error' });
    }

    // Validate username (e.g., length, characters)
    if (!username || username.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters', error: 'validation_error' });
    }

    // Check uniqueness
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ success: false, message: 'Username already taken', error: 'validation_error' });
    }

    user.username = username;
    user.isActive = true;
    await user.save();

    const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      data: { 
         user: {
            _id: user._id, 
            username: user.username, 
            email: user.email, 
            isAdmin: user.isAdmin,
            projectCount: user.projectsCount, 
            connectionsCount: user.connectionsCount,
            isActive: user.isActive
        },
        accessToken 
      },
      message: 'Username set successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials', error: 'auth_error' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials', error: 'auth_error' });
    }

    const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '90d' });

    res.json({
      success: true,
      data: { 
        user: {
            _id: user._id, 
            username: user.username, 
            email: user.email, 
            isAdmin: user.isAdmin,
            projectCount: user.projectsCount, 
            connectionsCount: user.connectionsCount,
            isActive: user.isActive
        }, 
        accessToken 
      },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
        .populate('projects', 'title description')
        .populate('connections', 'user1 user2 status');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'auth_error' });
    }

    if (!user.isActive) {
        return res.status(403).json({ success: false, message: "Please set your username first", error: 'auth_error' });
    }

    res.json({
      success: true,
      data: {
         _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        awards: user.awards,
        projectCount: user.projectsCount,
        projects: user.projects,
        connectionsCount: user.connectionsCount,
        connections: user.connections,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: 'User fetched',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const logout = async (req, res) => {
  try {
    await redisClient.setEx(`blacklist:${req.token}`, 3600, 'true'); // 1 hour blacklist
    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};