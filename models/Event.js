// models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  header: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true }, // Format: "DD/MM/YYYY"
  start: { type: String, required: true }, // Format: "09:00 AM"
  end: { type: String, required: true },   // Format: "11:00 AM"
  img: { type: String },
  desc: { type: String, required: true },
  favorites: {
    type: Array,
    default: []
  },
},
{ timestamps: true });

export default mongoose.model('Event', EventSchema);