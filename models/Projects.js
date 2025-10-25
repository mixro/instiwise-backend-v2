import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Optional collaborators
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Project', projectSchema);