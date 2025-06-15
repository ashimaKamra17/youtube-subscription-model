import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MCPResponse {
  namespace: string;
  data: any;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const MCPDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const fetchMCPData = async (namespace: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/mcp/${encodeURIComponent(namespace)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result: MCPResponse = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const namespaces = [
      "subscriptions://channels",
      "subscriptions://recent-videos",
      "subscriptions://categories",
      "subscriptions://stats",
    ];
    fetchMCPData(namespaces[activeTab]);
  }, [activeTab]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderChannelsView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Subscribed Channels
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Channel ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Subscribed Since</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.map((channel: any) => (
                    <TableRow key={channel.id}>
                      <TableCell>{channel.id}</TableCell>
                      <TableCell>{channel.title}</TableCell>
                      <TableCell>
                        {new Date(channel.subscribedSince).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderVideosView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Videos
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Video ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Channel ID</TableCell>
                    <TableCell>Published At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.map((video: any) => (
                    <TableRow key={video.id}>
                      <TableCell>{video.id}</TableCell>
                      <TableCell>{video.title}</TableCell>
                      <TableCell>{video.channelId}</TableCell>
                      <TableCell>
                        {new Date(video.publishedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCategoriesView = () => {
    const pieData = data?.map((category: any) => ({
      name: category?.category || "Unknown",
      value: category?.channels?.length || 0,
    }));

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Categories Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData?.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Categories List
              </Typography>
              {data?.map((category: any) => (
                <Box key={category.category} mb={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    {category.category}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {category.channels.map((channel: string) => (
                      <Chip key={channel} label={channel} size="small" />
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderStatsView = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Channels
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {data?.topChannels.map((channel: string) => (
                <Chip key={channel} label={channel} color="primary" />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Most Watched Category
            </Typography>
            <Typography variant="h4" color="primary">
              {data?.mostWatchedCategory}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Time Spent
            </Typography>
            <Typography variant="h4" color="secondary">
              {data?.timeSpent}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        YouTube Subscription Dashboard
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Channels" />
          <Tab label="Recent Videos" />
          <Tab label="Categories" />
          <Tab label="Stats" />
        </Tabs>
      </Box>
      {activeTab === 0 && renderChannelsView()}
      {activeTab === 1 && renderVideosView()}
      {activeTab === 2 && renderCategoriesView()}
      {activeTab === 3 && renderStatsView()}
    </Box>
  );
};

export default MCPDashboard;
