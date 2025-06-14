import React, { useEffect, useState } from "react";
import styled from "styled-components";

interface Channel {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  subscribedSince: string;
}

interface Video {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  channelTitle: string;
}

const Container = styled.div`
  margin-top: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
`;

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ChannelCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ChannelThumbnail = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
`;

const ChannelInfo = styled.div`
  padding: 1rem;
`;

const ChannelTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const ChannelDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ChannelMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const VideoList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const VideoCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const VideoThumbnail = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
`;

const VideoInfo = styled.div`
  padding: 1rem;
`;

const VideoTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const VideoMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ef4444;
`;

export const YouTubeSubscriptions: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch channels
        const channelsResponse = await fetch("/api/youtube/channels", {
          credentials: "include",
        });

        if (!channelsResponse.ok) {
          throw new Error("Failed to fetch channels");
        }

        const channelsData = await channelsResponse.json();
        setChannels(channelsData.channels);

        // Fetch recent videos for all channels
        const syncResponse = await fetch("/api/youtube/sync", {
          credentials: "include",
        });

        if (!syncResponse.ok) {
          throw new Error("Failed to fetch videos");
        }

        const syncData = await syncResponse.json();
        setVideos(syncData.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingMessage>Loading YouTube subscriptions...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  return (
    <Container>
      <Section>
        <SectionTitle>Subscribed Channels</SectionTitle>
        <ChannelGrid>
          {channels.map((channel) => (
            <ChannelCard key={channel.channelId}>
              <ChannelThumbnail src={channel.thumbnail} alt={channel.title} />
              <ChannelInfo>
                <ChannelTitle>{channel.title}</ChannelTitle>
                <ChannelDescription>{channel.description}</ChannelDescription>
                <ChannelMeta>
                  Subscribed since:{" "}
                  {new Date(channel.subscribedSince).toLocaleDateString()}
                </ChannelMeta>
              </ChannelInfo>
            </ChannelCard>
          ))}
        </ChannelGrid>
      </Section>

      <Section>
        <SectionTitle>Recent Videos</SectionTitle>
        <VideoList>
          {videos.map((video) => (
            <VideoCard key={video.videoId}>
              <VideoThumbnail src={video.thumbnail} alt={video.title} />
              <VideoInfo>
                <VideoTitle>{video.title}</VideoTitle>
                <VideoMeta>
                  <div>{video.channelTitle}</div>
                  <div>{new Date(video.publishedAt).toLocaleDateString()}</div>
                </VideoMeta>
              </VideoInfo>
            </VideoCard>
          ))}
        </VideoList>
      </Section>
    </Container>
  );
};
