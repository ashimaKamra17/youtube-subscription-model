import React, { useEffect, useState } from "react";

interface CategoryData {
  category: string;
  channels: string[];
}

interface StatsData {
  topChannels: string[];
  mostWatchedCategory: string;
  timeSpent: string;
}

interface AnalyticsData {
  categories: CategoryData[];
  stats: StatsData;
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch(
          "/api/mcp/subscriptions://categories",
          {
            credentials: "include",
          }
        );

        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const categoriesData = await categoriesResponse.json();

        // Fetch stats
        const statsResponse = await fetch("/api/mcp/subscriptions://stats", {
          credentials: "include",
        });

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch stats");
        }

        const statsData = await statsResponse.json();

        setData({
          categories: categoriesData.data,
          stats: statsData.data,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
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
          Analytics Overview
        </h2>
        <p className="text-gray-600">
          Detailed insights about your YouTube viewing habits and subscription
          patterns.
        </p>
      </div>

      {/* Top Categories */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Categories</h3>
        <div className="space-y-4">
          {data?.categories.map((category, index) => (
            <div key={index} className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full"
                  style={{ width: `${(category.channels.length / 10) * 100}%` }}
                ></div>
              </div>
              <span className="ml-4 text-sm text-gray-600">
                {category.category} ({category.channels.length} channels)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Top Channels
          </h3>
          <div className="space-y-2">
            {data?.stats.topChannels.map((channel, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm font-medium text-gray-800">
                  {index + 1}. {channel}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Most Watched Category
          </h3>
          <p className="text-2xl font-bold text-primary-600">
            {data?.stats.mostWatchedCategory}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Watch Time: {data?.stats.timeSpent}
          </p>
        </div>
      </div>
    </div>
  );
};
