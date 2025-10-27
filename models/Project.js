import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
      type: String,
      required: true,
      unique: true,
  },
  userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
  },
  description: {
      type: String,
      required: true,
  },
  img: {
      type: String,
      required: true,
  },
  category: {
      type: String,
      required: true,
  },
  problem: {
      type: String,
  },
  collaborators: {
      type: Array,
      default: []
  }, // Optional collaborators
  duration: {
      type: String,
  },
  status: {
      type: String,
      enum: ['in progress', 'on hold', 'completed'],
      default: 'in progress',
  },
  goals: {
      type: Array,
      required: true,
  },
  resources: {
      type: Array,
      default: [],
  },
  budget: {
      type: Array,
      default: [],
  },
  scope: {
      type: Array,
      default: [],
  },
  plan: {
      type: Array,
      default: [],
  },
  challenges: {
      type: Array,
      default: [],
  },
  likes: {
      type: Array,
      default: []
  },
},
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);