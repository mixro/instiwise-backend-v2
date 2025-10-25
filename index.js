import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import redisClient from './config/redis.js';
import rateLimit from 'express-rate-limit';
import connectDB from './config/mongodb.js';

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
    max: 100, // 100 requests per IP
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

// Error handling
app.use(errorHandler);

// Routes (to be expanded)
app.get('/', (req, res) => res.json({ success: true, message: 'InstiWise API' }));

// Start server
const PORT = process.env.PORT || 8800;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`INSTIWISE SERVER IS RUNNING ON PORT ${PORT}`);
  });
});