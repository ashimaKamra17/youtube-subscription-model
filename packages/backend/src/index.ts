import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import mcpRoutes from './routes/mcp';
import { connectDB } from './db';
import { fetchSubscribedChannels, fetchRecentVideos } from './services/youtubeService';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Debug middleware to log session state
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Session state:', {
    sessionID: req.sessionID,
    hasAccessToken: !!(req.session as any).accessToken,
    cookie: req.session?.cookie
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mcp', mcpRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// YouTube Data Endpoints
app.get('/api/youtube/channels', async (req: Request, res: Response) => {
  console.log('Full session object:', {
    sessionID: req.sessionID,
    cookie: req.session?.cookie,
    hasAccessToken: !!(req.session as any).accessToken,
    hasUser: !!(req.session as any).user,
    sessionData: req.session
  });

  const access_token = (req.session as any).accessToken;
  console.log('Access token in /channels:', {
    hasToken: !!access_token,
    tokenLength: access_token?.length,
    sessionID: req.sessionID,
    sessionCookie: req.session?.cookie,
    headers: req.headers
  });

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated. Please log in first.' });
  }

  try {
    const channels = await fetchSubscribedChannels(access_token);
    res.json({ 
      success: true, 
      channels 
    });
  } catch (err) {
    console.error('Error fetching channels:', err);
    res.status(500).json({ 
      error: 'Failed to fetch channels', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
});

app.get('/api/youtube/channels/:channelId/videos', async (req: Request, res: Response) => {
  const access_token = (req.session as any).accessToken;
  const { channelId } = req.params;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated. Please log in first.' });
  }

  try {
    const videos = await fetchRecentVideos(access_token, channelId);
    res.json({ 
      success: true, 
      videos 
    });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ 
      error: 'Failed to fetch videos', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
});

app.get('/api/youtube/sync', async (req: Request, res: Response) => {
  const access_token = (req.session as any).accessToken;

  if (!access_token) {
    return res.status(401).json({ error: 'Not authenticated. Please log in first.' });
  }

  try {
    const channels = await fetchSubscribedChannels(access_token);
    const allVideos = [];
    
    for (const channel of channels) {
      const videos = await fetchRecentVideos(access_token, channel.channelId);
      allVideos.push(...videos);
    }

    res.json({ 
      success: true, 
      message: '✅ Synced YouTube subscriptions & recent videos.',
      channelsCount: channels.length,
      videosCount: allVideos.length,
      channels,
      videos: allVideos
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ 
      error: 'Failed to sync data', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 4000;

// Initialize database connection and start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 