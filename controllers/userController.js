import User from '../models/User.js';
import bcrypt from 'bcryptjs';


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

// New: Self Password Change
export const changeSelfPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // Always from JWT
  console.log(userId);

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
