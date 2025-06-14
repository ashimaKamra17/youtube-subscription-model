import { AuthSession } from '@youtube-subscription-model/shared/auth';

declare module 'express-session' {
  interface SessionData {
    auth?: AuthSession;
  }
} 