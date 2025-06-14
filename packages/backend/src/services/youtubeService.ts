import axios from 'axios';
import { Channel, IChannel } from '../models/Channel';
import { Video, IVideo } from '../models/Video';

// 1. Fetch Subscribed Channels
export async function fetchSubscribedChannels(access_token: string): Promise<IChannel[]> {
  console.log('Fetching channels with token length:', access_token.length);
  
  const res = await axios.get('https://www.googleapis.com/youtube/v3/subscriptions', {
    headers: { Authorization: `Bearer ${access_token}` },
    params: {
      part: 'snippet',
      mine: true,
      maxResults: 50,
    },
  });

  console.log('YouTube API response status:', res.status);
  
  const channels: IChannel[] = res.data.items.map((item: any) => ({
    channelId: item.snippet.resourceId.channelId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.default.url,
    subscribedSince: item.snippet.publishedAt,
  }));

  for (const channel of channels) {
    await Channel.findOneAndUpdate({ channelId: channel.channelId }, channel, { upsert: true });
  }

  return channels;
}

// 2. Fetch Recent Videos from a Channel
export async function fetchRecentVideos(access_token: string, channelId: string): Promise<IVideo[]> {
  const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    headers: { Authorization: `Bearer ${access_token}` },
    params: {
      part: 'snippet',
      channelId,
      maxResults: 5,
      order: 'date',
      type: 'video',
    },
  });

  const videos: IVideo[] = res.data.items.map((item: any) => ({
    videoId: item.id.videoId,
    channelId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.default.url,
    publishedAt: item.snippet.publishedAt,
  }));

  for (const video of videos) {
    await Video.findOneAndUpdate({ videoId: video.videoId }, video, { upsert: true });
  }

  return videos;
} 