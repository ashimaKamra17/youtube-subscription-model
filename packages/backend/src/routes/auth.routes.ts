import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Login route
router.get('/login', (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

// Callback route
router.get('/callback', async (req: Request, res: Response) => {
  const { code } = req.query;
  
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const userInfo = await userInfoResponse.json();

    // Store tokens and user info in session
    (req.session as any).accessToken = tokens.access_token;
    (req.session as any).refreshToken = tokens.refresh_token;
    (req.session as any).user = userInfo;

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
    });

    console.log('Session after login:', {
      sessionID: req.sessionID,
      hasAccessToken: !!(req.session as any).accessToken,
      hasUser: !!(req.session as any).user,
      accessTokenLength: (req.session as any).accessToken?.length,
      userEmail: (req.session as any).user?.email
    });

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
  }
});

// Session route
router.get('/session', (req: Request, res: Response) => {
  console.log('Session check:', {
    sessionID: req.sessionID,
    hasAccessToken: !!(req.session as any).accessToken,
    hasUser: !!(req.session as any).user
  });

  if (!(req.session as any).user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    user: (req.session as any).user,
    isAuthenticated: true
  });
});

// Logout route
router.get('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

export default router; 