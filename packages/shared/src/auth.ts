export interface GoogleUser {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
  scope: string[];
}

export interface AuthSession {
  user: GoogleUser;
  tokens: TokenInfo;
}

export interface YouTubeCredentials {
  accessToken: string;
  refreshToken: string;
  expiryDate: Date;
  scope: string[];
}

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
] as const; 