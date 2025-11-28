import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns';


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')               // never return password
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      message: 'Users fetched successfully',
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'not_found' });
    }

    res.json({
      success: true,
      data: user,
      message: 'User fetched successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// --- Update User (Self or Admin) ---
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user.id.toString(); // For self-checks

  // Prevent password and isAdmin updates here
  delete updates.password;
  delete updates.isAdmin;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'not_found' });
    }

    // Unique checks for username/email
    if (updates.username && updates.username !== user.username) {
      const existingUsername = await User.findOne({ username: updates.username });
      if (existingUsername && existingUsername._id.toString() !== id) {
        return res.status(400).json({ success: false, message: 'Username already taken', error: 'validation_error' });
      }
    }

    if (updates.email && updates.email !== user.email) {
      const existingEmail = await User.findOne({ email: updates.email });
      if (existingEmail && existingEmail._id.toString() !== id) {
        return res.status(400).json({ success: false, message: 'Email already in use', error: 'validation_error' });
      }
    }

    // Apply updates
    Object.assign(user, updates);
    await user.save();

    const updatedUser = await User.findById(id).select('-password');

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

// --- Delete User (Self or Admin) ---
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------- ADMIN: Promote / Demote ----------
export const toggleAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'not_found' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({
      success: true,
      data: { isAdmin: user.isAdmin },
      message: `User ${user.isAdmin ? 'promoted to' : 'demoted from'} admin`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};

export const getUserTimelyAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Helper: Count users in date range
    const getCountInRange = async (field, startDate, endDate = now) => {
      return await User.countDocuments({
        [field]: { $gte: startDate, $lte: endDate }
      });
    };

    // === ALL-TIME GROSS METRICS ===
    const totalUsers = await User.countDocuments();
    const totalVerified = await User.countDocuments({ isVerified: true });
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    const googleUsers = await User.countDocuments({ googleId: { $exists: true } });
    const emailUsers = totalUsers - googleUsers;

    const gross = {
      totalUsers,
      totalVerified,
      totalAdmins,
      registrationSources: {
        google: googleUsers,
        emailPassword: emailUsers
      },
      percentageVerified: totalUsers > 0 ? Math.round((totalVerified / totalUsers) * 100) : 0
    };

    // === NEW USERS (based on createdAt) ===
    const todayNew = await getCountInRange('createdAt', startOfDay(now));
    const yesterdayNew = await getCountInRange('createdAt', startOfDay(subDays(now, 1)), startOfDay(now));

    const thisWeekNew = await getCountInRange('createdAt', startOfWeek(now));
    const lastWeekNew = await getCountInRange('createdAt', startOfWeek(subWeeks(now, 1)), startOfWeek(now));

    const thisMonthNew = await getCountInRange('createdAt', startOfMonth(now));
    const lastMonthNew = await getCountInRange('createdAt', startOfMonth(subMonths(now, 1)), startOfMonth(now));

    // === ACTIVE USERS (based on updatedAt — login/activity) ===
    const todayActive = await getCountInRange('updatedAt', startOfDay(now));
    const yesterdayActive = await getCountInRange('updatedAt', startOfDay(subDays(now, 1)), startOfDay(now));

    const thisWeekActive = await getCountInRange('updatedAt', startOfWeek(now));
    const lastWeekActive = await getCountInRange('updatedAt', startOfWeek(subWeeks(now, 1)), startOfWeek(now));

    const thisMonthActive = await getCountInRange('updatedAt', startOfMonth(now));
    const lastMonthActive = await getCountInRange('updatedAt', startOfMonth(subMonths(now, 1)), startOfMonth(now));

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
            newUsers: todayNew,
            activeUsers: todayActive,
            newUsersGrowth: percentChange(todayNew, yesterdayNew),
            activeUsersGrowth: percentChange(todayActive, yesterdayActive)
          },
          thisWeek: {
            newUsers: thisWeekNew,
            activeUsers: thisWeekActive,
            newUsersGrowth: percentChange(thisWeekNew, lastWeekNew),
            activeUsersGrowth: percentChange(thisWeekActive, lastWeekActive)
          },
          thisMonth: {
            newUsers: thisMonthNew,
            activeUsers: thisMonthActive,
            newUsersGrowth: percentChange(thisMonthNew, lastMonthNew),
            activeUsersGrowth: percentChange(thisMonthActive, lastMonthActive)
          }
        },
        generatedAt: now.toISOString()
      },
      message: 'User analytics fetched successfully'
    });
  } catch (error) {
    console.error('getUserTimelyAnalytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: 'server_error'
    });
  }
};
