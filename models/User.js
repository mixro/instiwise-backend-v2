import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String },
    course: { type: String },
    phone: { type: String },
    img: { type: String },
    bio: { type: String },
    awards: { type: Array, default: [] },
    connectionsCount: { type: Number, default: 0 }, // Tracks number of connections
    projectsCount: { type: Number, default: 0 }, // Tracks number of projects
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Middleware to update counts when connections or projects change
userSchema.pre('save', function (next) {
  if (this.isModified('connections') || this.isModified('projects')) {
    this.connectionsCount = this.connections ? this.connections.length : 0;
    this.projectCount = this.projects ? this.projects.length : 0;
  }
  next();
});

export default mongoose.model('User', userSchema);