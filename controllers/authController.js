import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import redisClient from '../config/redis.js';
import { clearRefreshCookie, generateTokens, setRefreshCookie } from '../utils/tokenUtils.js';

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

    const { accessToken, refreshToken } = generateTokens(user);
    
    if (!req.headers['x-mobile-app']) {
    // only for web requests
      setRefreshCookie(res, refreshToken);
    }

    res.status(201).json({
      success: true,
      data: { 
        user: {
            _id: user._id, 
            username: user.username, 
            email: user.email, 
            img: user.img,
            bio: user.bio,
            awards: user.awards,
            isAdmin: user.isAdmin,
            projectsCount: user.projectsCount, 
            connectionsCount: user.connectionsCount,
            isActive: user.isActive
        }, 
        accessToken ,
        refreshToken
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

    const { accessToken, refreshToken } = generateTokens(user);
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      data: { 
         user: {
            _id: user._id, 
            username: user.username, 
            email: user.email, 
            img: user.img,
            bio: user.bio,
            awards: user.awards,
            isAdmin: user.isAdmin,
            projectsCount: user.projectsCount, 
            connectionsCount: user.connectionsCount,
            isActive: user.isActive
        },
        accessToken, 
        refreshToken
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

    const { accessToken, refreshToken } = generateTokens(user);

    if (!req.headers['x-mobile-app']) {
    // only for web requests
      setRefreshCookie(res, refreshToken);
    }

    res.json({
      success: true,
      data: { 
        user: {
            _id: user._id, 
            username: user.username, 
            email: user.email, 
            img: user.img,
            bio: user.bio,
            awards: user.awards,
            isAdmin: user.isAdmin,
            projectsCount: user.projectsCount, 
            connectionsCount: user.connectionsCount,
            isActive: user.isActive
        }, 
        accessToken,
        refreshToken 
      },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
        
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'auth_error' });
    }

    if (!user.isActive) {
        return res.status(403).json({ success: false, message: "Please set your username first", error: 'auth_error' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        img: user.img,
        bio: user.bio,
        isAdmin: user.isAdmin,
        awards: user.awards,
        projectsCount: user.projectsCount,
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

export const refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token', error: 'auth_error' });
  }

  const isBlacklisted = await redisClient.get(`blacklist:refresh:${refreshToken}`);
  if (isBlacklisted) {
    return res.status(401).json({ success: false, message: 'Token revoked', error: 'auth_error' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'auth_error' });
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '90d' }
    );

    res.json({
      success: true,
      data: { accessToken },
      message: 'Token refreshed',
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token', error: 'auth_error' });
  }
};

// New: Self Password Change
export const changeSelfPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // Always from JWT
  console.log("checked")

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both passwords are required', error: 'validation_error' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'not_found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password', error: 'auth_error' });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};


export const logout = async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

  try {
    // Blacklist access token
    if (req.token) {
      await redisClient.setEx(`blacklist:${req.token}`, 90 * 24 * 3600, 'true');
    }

    // Blacklist refresh token
    if (refreshToken) {
      await redisClient.setEx(`blacklist:refresh:${refreshToken}`, 180 * 24 * 3600, 'true');
    }

    if (!req.headers['x-mobile-app']) {
      // only for web requests
      clearRefreshCookie(res);
    }

    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};