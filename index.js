import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import redisClient from './config/redis.js';
import rateLimit from 'express-rate-limit';
import connectDB from './config/mongodb.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projects.js';
import eventRoutes from './routes/events.js';
import newsRoutes from './routes/news.js';
import userRoutes from './routes/user.js';

// Load environment variables
dotenv.config({ quiet: true });

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
const allowedOrigins = ['http://localhost:8081', 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(cookieParser());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per IP
  })
);

// Initialize Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    process.exit(1);
  }
})();

// Routes 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/users', userRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8800;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 INSTIWISE SERVER IS RUNNING ON PORT ${PORT}`);
  });
});