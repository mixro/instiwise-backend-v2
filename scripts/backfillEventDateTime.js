// scripts/backfillEventDateTime.js
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import dotenv from 'dotenv';
dotenv.config();

const backfill = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const events = await Event.find({ dateTime: { $exists: false } }); // Only old ones
    console.log(`Found ${events.length} events to backfill`);

    let updated = 0;
    for (const event of events) {
      const [day, month, year] = event.date.split('/');
      const timeStr = event.start.trim();
      const isPM = /PM$/i.test(timeStr);
      const cleanTime = timeStr.replace(/AM|PM/i, '').trim();
      let [hours, minutes] = cleanTime.split(':').map(Number);

      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`;

      await Event.updateOne(
        { _id: event._id },
        { dateTime: new Date(isoString) }
      );
      updated++;
      if (updated % 100 === 0) console.log(`Updated ${updated}...`);
    }

    console.log(`Backfill complete: ${updated} events updated`);
    process.exit(0);
  } catch (error) {
    console.error('Backfill failed:', error);
    process.exit(1);
  }
};

backfill();