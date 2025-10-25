import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import redisClient from '../config/redis.js';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or username already in use', error: 'auth_error' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin: false,
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
        }, 
        accessToken 
      },
      message: 'User created',
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