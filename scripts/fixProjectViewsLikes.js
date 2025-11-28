// scripts/fixProjectViewsLikes.js
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import dotenv from 'dotenv';
dotenv.config();

const fixProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Project.updateMany(
      { $or: [{ views: { $exists: false } }, { likes: { $exists: false } }] },
      { $set: { views: [], likes: [] } }
    );

    console.log(`Fixed ${result.modifiedCount} projects`);
    process.exit(0);
  } catch (error) {
    console.error('Backfill failed:', error);
    process.exit(1);
  }
};

fixProjects();