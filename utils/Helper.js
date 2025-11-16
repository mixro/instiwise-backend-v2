// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, // Only for Google users
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional — null for Google users
  username: { type: String, required: true, unique: true },
  img: { type: String },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // Google users = true
  // ... other fields
}, { timestamps: true });

// Index for fast lookup
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);