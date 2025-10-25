import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // First user
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Second user
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // Connection status
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Connection', connectionSchema);