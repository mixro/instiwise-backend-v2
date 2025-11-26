import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true,
      default: function () {
        return `user_${Math.random().toString(36).substring(2, 9)}`
      }
    },
    googleId: { type: String, unique: true, sparse: true }, // Only for Google users
    email: { type: String, required: true, unique: true },
    password: { type: String },
    gender: { type: String },
    course: { type: String },
    phone: { type: String },
    img: { type: String },
    bio: { type: String },
    awards: { type: Array, default: [] },
    connectionsCount: { type: Number, default: 0 }, // Tracks number of connections
    projectsCount: { type: Number, default: 0 }, // Tracks number of projects
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false }, // Google users = true
    isActive: { type: Boolean, default: false }, // New field to track username setup
  },
  { timestamps: true }
);

// Index for fast lookup
//userSchema.index({ googleId: 1 });
//userSchema.index({ email: 1 });

// Middleware to update counts when connections or projects change
userSchema.pre('save', function (next) {
  if (this.isModified('connections') || this.isModified('projects')) {
    this.connectionsCount = this.connections ? this.connections.length : 0;
    this.projectCount = this.projects ? this.projects.length : 0;
  }
  next();
});

export default mongoose.model('User', userSchema);