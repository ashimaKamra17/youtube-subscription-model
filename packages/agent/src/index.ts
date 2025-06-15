import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import agentRouter from './routes/agent';

// Load environment variables
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const app = express();
const port = process.env.AGENT_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/agent', agentRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Agent service running on port ${port}`);
});

// console.log('Agent service starting...');
// console.log('Environment variables loaded:', {
//   NODE_ENV: process.env.NODE_ENV,
//   GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
//   GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI
// });

// TODO: Initialize agent service
// This will be implemented in future iterations 