import { Channel } from '../models/Channel';
import { Video } from '../models/Video';

// Type definitions for MCP responses
interface ChannelMCP {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscribedSince: Date;
}

interface VideoMCP {
  id: string;
  channelId: string;
  title: string;
  thumbnail: string;
  publishedAt: Date;
}

interface CategoryMCP {
  category: string;
  channels: string[];
}

interface StatsMCP {
  topChannels: string[];
  mostWatchedCategory: string;
  timeSpent: string;
}

interface MCPQuery {
  [key: string]: string | undefined;
}

// MCP namespace handlers
const MCP = {
  // Subscribed Channels
  "subscriptions://channels": async (query?: MCPQuery): Promise<ChannelMCP[]> => {
    const channels = await Channel.find();
    return channels.map((ch) => ({
      id: ch.channelId,
      title: ch.title,
      description: ch.description,
      thumbnail: ch.thumbnail,
      subscribedSince: ch.subscribedSince,
    }));
  },

  // Recent Videos
  "subscriptions://recent-videos": async (query?: MCPQuery): Promise<VideoMCP[]> => {
    const limit = query?.limit ? parseInt(query.limit) : 50;
    const videos = await Video.find()
      .sort({ publishedAt: -1 })
      .limit(limit);

    return videos.map((v) => ({
      id: v.videoId,
      channelId: v.channelId,
      title: v.title,
      thumbnail: v.thumbnail,
      publishedAt: v.publishedAt,
    }));
  },

  // Channel Categories
  "subscriptions://categories": async (query?: MCPQuery): Promise<CategoryMCP[]> => {
    // TODO: Implement actual category logic based on channel metadata
    const categories = {
      Tech: ["MKBHD", "Linus Tech Tips"],
      Cooking: ["Binging with Babish"],
      News: ["Vox", "DW News"],
    };

    return Object.entries(categories).map(([category, channels]) => ({
      category,
      channels,
    }));
  },

  // Personal Stats
  "subscriptions://stats": async (query?: MCPQuery): Promise<StatsMCP> => {
    // TODO: Implement actual stats calculation
    return {
      topChannels: ["MKBHD", "Daily News", "Cooking with Sarah"],
      mostWatchedCategory: "Tech",
      timeSpent: "12 hrs this week",
    };
  },
};

export default MCP; 