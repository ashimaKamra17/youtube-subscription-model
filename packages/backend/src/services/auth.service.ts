import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { TokenInfo, YouTubeCredentials } from '@youtube-subscription-model/shared/src/auth';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = dotenv.config().parsed || {};

export class AuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      throw new Error('Missing required environment variables for OAuth2');
    }

    console.log('Initializing OAuth2Client with:', {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: GOOGLE_REDIRECT_URI,
      // Don't log the secret for security
      hasSecret: !!GOOGLE_CLIENT_SECRET
    });
    
    this.oauth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl(): string {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent'
    });
    console.log('Generated auth URL:', url);
    return url;
  }

  async getTokens(code: string): Promise<TokenInfo> {
    const { tokens } = await this.oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get tokens');
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: new Date(tokens.expiry_date || Date.now() + 3600000),
      scope: tokens.scope?.split(' ') || []
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<YouTubeCredentials> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    return {
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || refreshToken,
      expiryDate: new Date(credentials.expiry_date || Date.now() + 3600000),
      scope: credentials.scope?.split(' ') || []
    };
  }

  async getUserInfo(accessToken: string) {
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const people = google.people({
      version: 'v1',
      auth: this.oauth2Client
    });
    const { data } = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos'
    });
    return {
      id: data.resourceName?.split('/')[1],
      email: data.emailAddresses?.[0]?.value,
      name: data.names?.[0]?.displayName,
      picture: data.photos?.[0]?.url
    };
  }
} 