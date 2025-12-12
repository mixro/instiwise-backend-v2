// models/DemoRequest.js
import mongoose from "mongoose";

const DemoRequestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  instituteName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true
  },
  studentStrength: {
    type: String,
    enum: ["< 500", "500 – 2,000", "2,000 – 10,000", "10,000 – 30,000", "30,000+"],
    default: null
  },
  message: {
    type: String,
    trim: true,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "contacted", "scheduled", "completed", "rejected"],
    default: "pending"
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
},
{ timestamps: true });

// Indexes for fast queries
DemoRequestSchema.index({ createdAt: -1 });
DemoRequestSchema.index({ status: 1 });

export default mongoose.model('DemoRequest', DemoRequestSchema);