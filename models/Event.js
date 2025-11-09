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

  dateTime: { type: Date, required: true }
},
{ timestamps: true });

// PRE-SAVE MIDDLEWARE
EventSchema.pre('save', function (next) {
  try {
    const [day, month, year] = this.date.split('/');
    const timeStr = this.start.trim();
    const isPM = /PM$/i.test(timeStr);
    const cleanTime = timeStr.replace(/AM|PM/i, '').trim();
    let [hours, minutes] = cleanTime.split(':').map(Number);

    // Handle 12-hour format
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    // Build ISO string in UTC
    const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`;
    this.dateTime = new Date(isoString);

    next();
  } catch (error) {
    next(error); // Let Mongoose handle validation error
  }
});

export default mongoose.model('Event', EventSchema);