import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, BarChart, Bar, Legend,
} from 'recharts';
import { Heart, Smile, Frown, Meh } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import PlatformBadge from '../components/PlatformBadge';
import {
  sentimentExtended, emotionRadar, samplePosts, platformSentiment,
} from '../data/mockData';
import './SentimentPage.css';

const chartTooltipStyle = {
  backgroundColor: 'rgba(15, 17, 23, 0.95)',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#e2e8f0',
  fontSize: '0.8rem',
};

function SentimentGauge() {
  const positiveVal = 73;
  const negativeVal = 15;
  const neutralVal = 12;
  const circumference = 2 * Math.PI * 60;
  const positiveOffset = circumference - (positiveVal / 100) * circumference;

  return (
    <div className="sentiment-gauge">
      <div className="gauge-ring">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle className="gauge-track" cx="80" cy="80" r="60" />
          <circle
            className="gauge-fill positive"
            cx="80" cy="80" r="60"
            strokeDasharray={circumference}
            strokeDashoffset={positiveOffset}
          />
        </svg>
        <div className="gauge-center">
          <div className="gauge-value">{positiveVal}%</div>
          <div className="gauge-label">Positive</div>
        </div>
      </div>

      <div className="gauge-breakdown">
        <div className="gauge-breakdown-item">
          <span className="gauge-breakdown-label">😊 Positive</span>
          <div className="gauge-breakdown-bar-wrap">
            <div className="gauge-breakdown-bar" style={{ width: `${positiveVal}%`, background: '#34d399' }} />
          </div>
          <span className="gauge-breakdown-value">{positiveVal}%</span>
        </div>
        <div className="gauge-breakdown-item">
          <span className="gauge-breakdown-label">😤 Negative</span>
          <div className="gauge-breakdown-bar-wrap">
            <div className="gauge-breakdown-bar" style={{ width: `${negativeVal}%`, background: '#fb7185' }} />
          </div>
          <span className="gauge-breakdown-value">{negativeVal}%</span>
        </div>
        <div className="gauge-breakdown-item">
          <span className="gauge-breakdown-label">😐 Neutral</span>
          <div className="gauge-breakdown-bar-wrap">
            <div className="gauge-breakdown-bar" style={{ width: `${neutralVal}%`, background: '#fbbf24' }} />
          </div>
          <span className="gauge-breakdown-value">{neutralVal}%</span>
        </div>
      </div>
    </div>
  );
}

export default function SentimentPage() {
  return (
    <div className="sentiment-page animate-fade-in">
      {/* Header */}
      <div className="sentiment-header">
        <h1>Sentiment Analysis</h1>
        <p className="sentiment-header-sub">Multi-dimensional NLP-based emotion detection across all platforms</p>
      </div>

      {/* Quick Stats */}
      <div className="grid-4 stagger-children">
        <StatCard icon={Smile} label="Positive Posts" value="73%" change={5.7} trend="up" accent="emerald" />
        <StatCard icon={Frown} label="Negative Posts" value="15%" change={3.2} trend="down" accent="rose" />
        <StatCard icon={Meh} label="Neutral Posts" value="12%" change={1.1} trend="down" accent="amber" />
        <StatCard icon={Heart} label="Avg. Emotion Score" value="0.72" change={4.8} trend="up" accent="purple" />
      </div>

      {/* Gauge Card */}
      <ChartCard title="Overall Sentiment Distribution" subtitle="Aggregate sentiment across all tracked platforms">
        <SentimentGauge />
      </ChartCard>

      {/* Sentiment Timeline + Emotion Radar */}
      <div className="sentiment-charts-row">
        <ChartCard title="Sentiment Over Time" subtitle="30-day sentiment trend" tabs={['7D', '30D', '90D']}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentExtended}>
              <defs>
                <linearGradient id="sentPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sentNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fb7185" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="positive" stroke="#34d399" fill="url(#sentPos)" strokeWidth={2} name="Positive" />
              <Area type="monotone" dataKey="negative" stroke="#fb7185" fill="url(#sentNeg)" strokeWidth={2} name="Negative" />
              <Area type="monotone" dataKey="neutral" stroke="#64748b" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Neutral" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Emotion Radar" subtitle="Nuanced emotion breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={emotionRadar} outerRadius="70%">
              <PolarGrid stroke="rgba(148,163,184,0.1)" />
              <PolarAngleAxis dataKey="emotion" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Emotions" dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Platform Sentiment Comparison */}
      <ChartCard title="Platform Sentiment Comparison" subtitle="How sentiment varies across social platforms">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={platformSentiment}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
            <XAxis dataKey="platform" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />
            <Bar dataKey="positive" fill="#34d399" radius={[4, 4, 0, 0]} name="Positive" />
            <Bar dataKey="negative" fill="#fb7185" radius={[4, 4, 0, 0]} name="Negative" />
            <Bar dataKey="neutral" fill="#64748b" radius={[4, 4, 0, 0]} name="Neutral" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Sample Posts */}
      <ChartCard title="Sample Posts Analysis" subtitle="Representative posts with NLP sentiment scores">
        <div className="sample-posts-grid">
          <div className="sample-posts-section">
            <h4><span style={{ color: '#34d399' }}>😊</span> Top Positive Posts</h4>
            {samplePosts.positive.map((post) => (
              <div key={post.id} className="sample-post positive">
                <div className="sample-post-user">{post.user}</div>
                <div className="sample-post-text">{post.text}</div>
                <div className="sample-post-meta">
                  <PlatformBadge platform={post.platform} />
                  <span className="sentiment-score pos">Score: {post.score}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="sample-posts-section">
            <h4><span style={{ color: '#fb7185' }}>😤</span> Top Negative Posts</h4>
            {samplePosts.negative.map((post) => (
              <div key={post.id} className="sample-post negative">
                <div className="sample-post-user">{post.user}</div>
                <div className="sample-post-text">{post.text}</div>
                <div className="sample-post-meta">
                  <PlatformBadge platform={post.platform} />
                  <span className="sentiment-score neg">Score: {post.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
