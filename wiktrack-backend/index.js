import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dashboardRoutes from './routes/dashboard.js';
import authRoutes from './routes/auth.js';
import { startDailySummaryCron } from './jobs/dailySummary.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'WikTrack Backend', version: '1.0.0' });
});

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// Start daily summary cron job
startDailySummaryCron();

// Start server
app.listen(PORT, () => {
  console.log(`WikTrack backend running on port ${PORT}`);
});
