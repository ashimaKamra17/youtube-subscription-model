import React, { useEffect, useState } from "react";

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
  channelId: string;
}

interface SyncResponse {
  success: boolean;
  message: string;
  channelsCount: number;
  videosCount: number;
  channels: Channel[];
  videos: Video[];
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<SyncResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/youtube/sync", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const syncData = await response.json();
        setData(syncData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Welcome to YouTube Assistant
        </h2>
        <p className="text-gray-600">
          Get insights about your YouTube subscriptions and manage your content
          effectively.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Subscriptions
          </h3>
          <p className="text-3xl font-bold text-primary-600">
            {data?.channelsCount || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Recent Videos
          </h3>
          <p className="text-3xl font-bold text-primary-600">
            {data?.videosCount || 0}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Last Updated
          </h3>
          <p className="text-3xl font-bold text-primary-600">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Recent Videos */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Recent Videos
        </h3>
        <div className="space-y-4">
          {data?.videos.slice(0, 5).map((video) => (
            <div
              key={video.videoId}
              className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-24 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{video.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
