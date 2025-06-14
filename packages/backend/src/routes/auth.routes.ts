import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthSession } from '@youtube-subscription-model/shared/src/auth';

const router = Router();
const authService = new AuthService();

// Initialize OAuth flow
router.get('/login', (req: Request, res: Response) => {
  const authUrl = authService.getAuthUrl();
  res.redirect(authUrl);
});

// OAuth callback
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('http://localhost:5173/login?error=' + error);
    }
    
    if (!code || typeof code !== 'string') {
      console.error('Invalid authorization code:', code);
      throw new Error('Invalid authorization code');
    }

    console.log('Received authorization code:', code);
    const tokens = await authService.getTokens(code);
    console.log('Received tokens:', { ...tokens, accessToken: '[REDACTED]' });
    
    const userInfo = await authService.getUserInfo(tokens.accessToken);
    console.log('Received user info:', userInfo);

    const session: AuthSession = {
      user: {
        id: userInfo.id!,
        email: userInfo.email!,
        displayName: userInfo.name!,
        picture: userInfo.picture || undefined
      },
      tokens
    };

    // Store session
    (req.session as any).auth = session;

    // Redirect to frontend
    res.redirect('http://localhost:5173/dashboard');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect('http://localhost:5173/login?error=auth_failed');
  }
});

// Get current session
router.get('/session', (req: Request, res: Response) => {
  const session = (req.session as any).auth as AuthSession | undefined;
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(session);
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

export default router; 