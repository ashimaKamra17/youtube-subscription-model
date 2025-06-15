import OpenAI from 'openai';
import { YouTubeChannel } from '@youtube-subscription-model/shared';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

interface Video {
  id: string;
  title: string;
  channelId: string;
  publishedAt: Date;
  viewCount: number;
}

interface Stats {
  topChannels: string[];
  mostWatchedCategory: string;
  timeSpent: string;
}

// MCP endpoint integration
const MCP = {
  'subscriptions://channels': async (): Promise<YouTubeChannel[]> => {
    const namespace = encodeURIComponent('subscriptions://channels');
    const response = await axios.get(`${BACKEND_URL}/api/mcp/${namespace}`);
    return response.data.data;
  },
  'subscriptions://recent-videos': async (): Promise<Video[]> => {
    const namespace = encodeURIComponent('subscriptions://recent-videos');
    const response = await axios.get(`${BACKEND_URL}/api/mcp/${namespace}`);
    return response.data.data;
  },
  'subscriptions://stats': async (): Promise<Stats> => {
    const namespace = encodeURIComponent('subscriptions://stats');
    const response = await axios.get(`${BACKEND_URL}/api/mcp/${namespace}`);
    return response.data.data;
  }
};

export async function agentPrompt(userQuery: string): Promise<string> {
  try {
    // MCP Context Fetch
    const [channels, videos, stats] = await Promise.all([
      MCP['subscriptions://channels'](),
      MCP['subscriptions://recent-videos'](),
      MCP['subscriptions://stats']()
    ]);

    const systemContext = `
You are a YouTube subscription assistant. 
Here is the user's current YouTube world:

- Subscribed Channels: ${JSON.stringify(channels.slice(0, 5))}
- Recent Videos: ${JSON.stringify(videos.slice(0, 5))}
- Personal Analytics: ${JSON.stringify(stats)}

Based on this, answer user questions in a helpful tone.
`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemContext },
      { role: "user", content: userQuery }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-3.5-turbo"
      messages,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    return content;
  } catch (error) {
    console.error('Error in agent prompt:', error);
    throw new Error('Failed to process AI response');
  }
} 