import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import PlatformBadge from '../components/PlatformBadge';
import { trendingTopics, trendVelocity, kpiStats } from '../data/mockData';
import './TrendsPage.css';

const chartTooltipStyle = {
  backgroundColor: 'rgba(15, 17, 23, 0.95)',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#e2e8f0',
  fontSize: '0.8rem',
};

const velocityColors = ['#22d3ee', '#a78bfa', '#fb7185', '#34d399', '#fbbf24'];

export default function TrendsPage() {
  return (
    <div className="trends-page animate-fade-in">
      {/* Header */}
      <div className="trends-header">
        <h1>Trend & Topic Detection</h1>
        <p className="trends-header-sub">Identify, rank, and predict rising trends in real-time</p>
      </div>

      {/* Quick Stats */}
      <div className="grid-3 stagger-children">
        <StatCard icon={TrendingUp} label="Active Trends" value="128" change={12.5} trend="up" accent="cyan" />
        <StatCard icon={Zap} label="Viral Topics (24h)" value="14" change={42.6} trend="up" accent="purple" />
        <StatCard icon={TrendingDown} label="Declining Topics" value="23" change={8.1} trend="down" accent="rose" />
      </div>

      {/* Velocity Chart + Keyword Cloud */}
      <div className="trends-charts-row">
        <ChartCard title="Trend Velocity" subtitle="How fast each topic is rising today">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendVelocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="aiRevolution" stroke="#22d3ee" strokeWidth={2} dot={false} name="#AIRevolution" />
              <Line type="monotone" dataKey="climateAction" stroke="#34d399" strokeWidth={2} dot={false} name="#ClimateAction" />
              <Line type="monotone" dataKey="budget" stroke="#fb7185" strokeWidth={2} dot={false} name="Budget2025" />
              <Line type="monotone" dataKey="startup" stroke="#a78bfa" strokeWidth={2} dot={false} name="#StartupIndia" />
              <Line type="monotone" dataKey="crypto" stroke="#fbbf24" strokeWidth={2} dot={false} name="#CryptoMarket" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trending Keywords" subtitle="Most discussed keywords right now">
          <div className="keyword-cloud">
            {trendingTopics.map((t, i) => (
              <span
                key={t.id}
                className="keyword-tag"
                style={{ fontSize: `${Math.max(0.75, 1.4 - i * 0.08)}rem` }}
              >
                {t.topic}
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Full Trending Table */}
      <ChartCard title="All Trending Topics" subtitle="Ranked by post volume and velocity">
        <div className="trends-table-wrap">
          <table className="trends-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Topic</th>
                <th>Posts</th>
                <th>Velocity</th>
                <th>Change</th>
                <th>Sentiment</th>
                <th>Platform</th>
              </tr>
            </thead>
            <tbody>
              {trendingTopics.map((topic, index) => (
                <tr key={topic.id}>
                  <td>
                    <div className="trend-rank">{index + 1}</div>
                  </td>
                  <td className="trend-topic-name">{topic.topic}</td>
                  <td>{topic.posts.toLocaleString()}</td>
                  <td>{topic.velocity}/hr</td>
                  <td>
                    <span className={`trend-change ${topic.change >= 0 ? 'positive' : 'negative'}`}>
                      {topic.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(topic.change)}%
                    </span>
                  </td>
                  <td>
                    <span className={`trend-sentiment-dot ${topic.sentiment}`} />
                    {topic.sentiment}
                  </td>
                  <td>
                    <PlatformBadge platform={topic.platform} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
