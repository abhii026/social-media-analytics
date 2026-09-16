import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend,
} from 'recharts';
import { FileText, Users, TrendingUp, Heart, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import PlatformBadge from '../components/PlatformBadge';
import {
  kpiStats, sentimentTimeline, trendingTopics,
  platformDistribution, recentActivity,
} from '../data/mockData';
import './DashboardPage.css';

const activityIcons = {
  trend: '📈', sentiment: '💚', network: '🔗', alert: '⚠️', demographic: '👥',
};

const chartTooltipStyle = {
  backgroundColor: 'rgba(15, 17, 23, 0.95)',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#e2e8f0',
  fontSize: '0.8rem',
};

export default function DashboardPage() {
  return (
    <div className="dashboard-page animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Analytics Overview</h1>
          <p className="dashboard-header-sub">Real-time social media intelligence across all platforms</p>
        </div>
        <div className="dashboard-time-badge">
          <span className="live-dot" />
          Live — Last updated 30s ago
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid-4 stagger-children">
        <StatCard
          icon={FileText}
          label="Total Posts Analyzed"
          value={kpiStats.totalPosts.value}
          change={kpiStats.totalPosts.change}
          trend={kpiStats.totalPosts.trend}
          accent="cyan"
        />
        <StatCard
          icon={Users}
          label="Active Users Tracked"
          value={kpiStats.activeUsers.value}
          change={kpiStats.activeUsers.change}
          trend={kpiStats.activeUsers.trend}
          accent="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Trending Topics"
          value={kpiStats.trendingTopics.value}
          change={kpiStats.trendingTopics.change}
          trend={kpiStats.trendingTopics.trend}
          accent="amber"
        />
        <StatCard
          icon={Heart}
          label="Average Sentiment"
          value={kpiStats.avgSentiment.value}
          change={kpiStats.avgSentiment.change}
          trend={kpiStats.avgSentiment.trend}
          accent="emerald"
        />
      </div>

      {/* Charts Row 1: Sentiment + Platform Distribution */}
      <div className="dashboard-charts-row">
        <ChartCard
          title="Sentiment Trend"
          subtitle="7-day sentiment breakdown across platforms"
          tabs={['7D', '30D', '90D']}
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={sentimentTimeline}>
              <defs>
                <linearGradient id="gradPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="positive" stroke="#34d399" fill="url(#gradPositive)" strokeWidth={2} />
              <Area type="monotone" dataKey="negative" stroke="#fb7185" fill="url(#gradNegative)" strokeWidth={2} />
              <Area type="monotone" dataKey="neutral" stroke="#64748b" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform Mix" subtitle="Post distribution by source">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={platformDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {platformDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
            {platformDistribution.map((p, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                {p.name} ({p.value}%)
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2: Top Trends + Activity Feed */}
      <div className="dashboard-charts-row">
        <ChartCard title="Top Trending Topics" subtitle="Posts volume for top 5 topics">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trendingTopics.slice(0, 5)} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="topic" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={120} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="posts" radius={[0, 6, 6, 0]} fill="url(#barGrad)">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Recent Activity" subtitle="Latest platform events">
          <div className="activity-feed">
            {recentActivity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className={`activity-icon ${item.type}`}>
                  {activityIcons[item.type]}
                </div>
                <div className="activity-content">
                  <div className="activity-message">{item.message}</div>
                  <div className="activity-meta">
                    <Clock size={11} />
                    {item.time}
                    <PlatformBadge platform={item.platform} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
