import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Allow any origin for now
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running...' });
});

// Routes will be imported here
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contestRoutes from './routes/contestRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
