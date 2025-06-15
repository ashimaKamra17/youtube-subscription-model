import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import McpDashboard from "./components/MCPDashboard";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/mcp-dashboard" element={<McpDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
