// Common types for the YouTube Subscription Manager
export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  lastUpdated: Date;
}

export interface Subscription {
  channelId: string;
  userId: string;
  subscribedAt: Date;
  notificationPreferences: {
    newVideos: boolean;
    liveStreams: boolean;
    communityPosts: boolean;
  };
}

// Common utilities
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
}; 