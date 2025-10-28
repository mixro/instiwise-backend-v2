import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  header: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  start: {
    type: String,
    required: true,
  },
  end: {
    type: String,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  img: {
    type: String,
  },
  desc: {
    type: String,
    required: true
  },
},
  { timestamps: true }
);

export default mongoose.model('Event', EventSchema);