import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Sentiment from './pages/Sentiment';
import Audience from './pages/Audience';
import Network from './pages/Network';
import Insights from './pages/Insights';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/sentiment" element={<Sentiment />} />
        <Route path="/audience" element={<Audience />} />
        <Route path="/network" element={<Network />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
