import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// console.log('Agent service starting...');
// console.log('Environment variables loaded:', {
//   NODE_ENV: process.env.NODE_ENV,
//   GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
//   GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI
// });

// TODO: Initialize agent service
// This will be implemented in future iterations 