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

  // Prevent password update here
  delete updates.password;
  delete updates.isAdmin; // Admin status only via toggle

  try {
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
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

// ---------- ADMIN: Change Password (secure) ----------
export const changeUserPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ success: false, message: 'Password must be at least 8 characters', error: 'validation_error' });
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', error: 'not_found' });
    }

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: 'server_error' });
  }
};