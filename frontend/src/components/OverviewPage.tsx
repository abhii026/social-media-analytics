import React, { useState, useMemo } from 'react';
import { OverviewData, Post, SentimentData, TrendItem, PlatformFilter } from '../types';
import { ThumbsUp, ThumbsDown, Hash, Layers, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

interface OverviewPageProps {
  overview: OverviewData | null;
  posts: Post[];
  sentiment: SentimentData | null;
  trends: TrendItem[];
  dataScope?: 'all' | 'real' | 'test';
  onSwitchScope?: (scope: 'all' | 'real' | 'test') => void;
  selectedPlatform?: PlatformFilter;
  onSelectPlatform?: (platform: PlatformFilter) => void;
  theme?: 'light' | 'dark';
  onNavigateToConversations?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  overview,
  posts,
  sentiment,
  trends,
  selectedPlatform = 'All',
  onSelectPlatform,
  onPrevPage,
  onNextPage,
}) => {
  // Slicers / Filters
  const [platformFilter, setPlatformFilter] = useState<string>(selectedPlatform);
  const [sentimentFilter, setSentimentFilter] = useState<string>('All');

  // Keep local platformFilter synced with external selectedPlatform if changed
  React.useEffect(() => {
    setPlatformFilter(selectedPlatform);
  }, [selectedPlatform]);

  const handlePlatformChange = (p: string) => {
    setPlatformFilter(p);
    if (onSelectPlatform) {
      onSelectPlatform(p as PlatformFilter);
    }
  };

  const handleResetFilters = () => {
    handlePlatformChange('All');
    setSentimentFilter('All');
  };

  // Dynamically filter posts according to active filters
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (platformFilter !== 'All' && p.platform !== platformFilter) return false;
      if (sentimentFilter !== 'All' && p.sentiment !== sentimentFilter) return false;
      return true;
    });
  }, [posts, platformFilter, sentimentFilter]);

  if (!overview) return null;

  // Fully dynamic metrics based on filtered records
  const total = filteredPosts.length;
  const posCount = filteredPosts.filter((p) => p.sentiment === 'Positive').length;
  const negCount = filteredPosts.filter((p) => p.sentiment === 'Negative').length;
  const neuCount = filteredPosts.filter((p) => p.sentiment === 'Neutral').length;

  const posPct = total > 0 ? Math.round((posCount / total) * 100) : 0;
  const negPct = total > 0 ? Math.round((negCount / total) * 100) : 0;

  // Dynamic Donut Distribution (Vibrant high-contrast green, red, slate)
  const dynamicDistribution = useMemo(() => {
    const list = [
      { name: 'Positive', value: posCount },
      { name: 'Negative', value: negCount },
      { name: 'Neutral', value: neuCount },
    ].filter((d) => d.value > 0);
    return list.length > 0 ? list : [{ name: 'No Data', value: 1 }];
  }, [posCount, negCount, neuCount]);

  // Dynamic Timeline for Area Chart
  const dynamicTimeline = useMemo(() => {
    if (filteredPosts.length === 0) return [];
    const buckets: Record<string, { time_bucket: string; positive: number; negative: number; neutral: number }> = {};
    filteredPosts.forEach((p) => {
      const timeStr = p.timestamp ? (p.timestamp.split(' ')[1]?.slice(0, 5) || p.timestamp.slice(11, 16) || '00:00') : '00:00';
      if (!buckets[timeStr]) {
        buckets[timeStr] = { time_bucket: timeStr, positive: 0, negative: 0, neutral: 0 };
      }
      if (p.sentiment === 'Positive') buckets[timeStr].positive += 1;
      else if (p.sentiment === 'Negative') buckets[timeStr].negative += 1;
      else buckets[timeStr].neutral += 1;
    });
    const sorted = Object.values(buckets).sort((a, b) => a.time_bucket.localeCompare(b.time_bucket));
    return sorted.length > 0 ? sorted : (sentiment?.timeline || []);
  }, [filteredPosts, sentiment]);

  // Dynamic Topics Bar Data (Using One Dark `#00509d` and One Light `#60a5fa` blue from Crop Health sample)
  const dynamicTopics = useMemo(() => {
    const activeTrends = trends.filter((t) => {
      if (platformFilter === 'All' && sentimentFilter === 'All') return true;
      return filteredPosts.some((p) => p.text.toLowerCase().includes(t.keyword.toLowerCase()));
    });
    const sourceList = activeTrends.length > 0 ? activeTrends : trends;
    return sourceList.slice(0, 5).map((t, idx) => ({
      keyword: `#${t.keyword}`,
      mentions: t.mention_count,
      fillColor: idx % 2 === 0 ? '#00509d' : '#60a5fa',
    }));
  }, [trends, filteredPosts, platformFilter, sentimentFilter]);

  // Chart Palette (Human-Selected Authoritative Colors - No Pastels)
  const sentimentColors: Record<string, string> = {
    Positive: '#047857', // Deep Emerald Green
    Negative: '#b91c1c', // Deep Crimson Red
    Neutral: '#475569',  // Sleek Charcoal Slate
    'No Data': '#e2e8f0',
  };

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#1e293b',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#0f172a',
    fontWeight: 'bold',
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Header Capsule with Page Navigation Buttons (Crop Health Sample Style) */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevPage}
          title="Previous Page"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-900 border-2 border-neutral-900 flex items-center justify-center shadow-xs transition cursor-pointer font-black shrink-0"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
        </button>

        <div className="border-2 border-neutral-900 bg-neutral-100 px-5 sm:px-8 py-1 rounded-2xl shadow-xs text-center">
          <span className="text-xs sm:text-sm font-black tracking-wider text-neutral-900 uppercase">
            Overview
          </span>
        </div>

        <button
          type="button"
          onClick={onNextPage}
          title="Next Page"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-900 border-2 border-neutral-900 flex items-center justify-center shadow-xs transition cursor-pointer font-black shrink-0"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
        </button>
      </div>

      {/* 2. Interactive Slicer / Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-1 px-3 bg-white border-2 border-neutral-800 rounded-xl text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px]">
            FILTERS:
          </span>

          <div className="flex items-center space-x-1.5">
            <label htmlFor="platform-select" className="text-neutral-700 font-bold text-xs">
              Platform:
            </label>
            <select
              id="platform-select"
              value={platformFilter}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="px-2 py-0.5 bg-neutral-100 border border-neutral-400 rounded text-neutral-900 text-xs focus:outline-hidden cursor-pointer font-bold"
            >
              <option value="All">All Platforms</option>
              <option value="Telegram">Telegram</option>
              <option value="X">X</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <label htmlFor="sentiment-select" className="text-neutral-700 font-bold text-xs">
              Sentiment:
            </label>
            <select
              id="sentiment-select"
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="px-2 py-0.5 bg-neutral-100 border border-neutral-400 rounded text-neutral-900 text-xs focus:outline-hidden cursor-pointer font-bold"
            >
              <option value="All">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>
        </div>

        {(platformFilter !== 'All' || sentimentFilter !== 'All') && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 font-bold text-xs text-rose-700 hover:text-rose-900 cursor-pointer px-2 py-0.5 bg-rose-50 border border-rose-300 rounded"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 3. Defined KPI Strip with Bold Eye-Catching Metrics (Crop Health Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* KPI 1: Total Records */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl px-3 py-2 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-sky-100 border border-sky-400 flex items-center justify-center flex-shrink-0 text-sky-700">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-2xl font-black text-sky-700 block leading-none">{total}</span>
            <span className="text-[11px] font-bold text-neutral-600 block mt-0.5">Total Records</span>
            <span className="text-[10px] text-neutral-500 font-medium">
              {platformFilter === 'All' ? 'All Platforms' : platformFilter}
            </span>
          </div>
        </div>

        {/* KPI 2: Positive Sentiment */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl px-3 py-2 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center flex-shrink-0 text-emerald-700">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-2xl font-black text-emerald-700 block leading-none">{posPct}%</span>
            <span className="text-[11px] font-bold text-neutral-600 block mt-0.5">Positive Reaction</span>
            <span className="text-[10px] text-neutral-500 font-medium">{posCount} posts</span>
          </div>
        </div>

        {/* KPI 3: Negative Sentiment */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl px-3 py-2 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-400 flex items-center justify-center flex-shrink-0 text-rose-700">
            <ThumbsDown className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-2xl font-black text-rose-700 block leading-none">{negPct}%</span>
            <span className="text-[11px] font-bold text-neutral-600 block mt-0.5">Negative Issues</span>
            <span className="text-[10px] text-neutral-500 font-medium">{negCount} posts</span>
          </div>
        </div>

        {/* KPI 4: Active Topics */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl px-3 py-2 shadow-xs flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center flex-shrink-0 text-amber-700">
            <Hash className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-2xl font-black text-amber-700 block leading-none">{dynamicTopics.length}</span>
            <span className="text-[11px] font-bold text-neutral-600 block mt-0.5">Active Topics</span>
            <span className="text-[10px] text-neutral-500 block truncate font-medium">
              Top: {dynamicTopics[0]?.keyword || '#none'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. High-Contrast Charts Row (All Side-by-Side to Fit on One Screen Without Scrolling) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Chart 1: Sentiment Breakdown (Donut Chart) */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-3 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
              Sentiment Breakdown
            </h3>
            <p className="text-[11px] text-neutral-500">Distribution of collected discussions</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {dynamicDistribution.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={sentimentColors[entry.name] || '#60a5fa'}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sentiment Over Time (Area Chart) */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-3 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
              Sentiment Over Time
            </h3>
            <p className="text-[11px] text-neutral-500">Volume dynamics across time buckets</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicTimeline} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="otPositiveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="otNegativeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#b91c1c" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="otNeutralGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#475569" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time_bucket" stroke="#475569" fontSize={9} fontStyle="bold" />
                <YAxis stroke="#475569" fontSize={9} allowDecimals={false} fontStyle="bold" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="positive" name="Positive" stroke="#047857" strokeWidth={2.5} fill="url(#otPositiveGrad)" />
                <Area type="monotone" dataKey="negative" name="Negative" stroke="#b91c1c" strokeWidth={2.5} fill="url(#otNegativeGrad)" />
                <Area type="monotone" dataKey="neutral" name="Neutral" stroke="#475569" strokeWidth={1.5} strokeDasharray="3 3" fill="url(#otNeutralGrad)" />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px', fontWeight: 'bold' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Topic Frequency (One Dark & One Light Blue Bar Chart - Crop Health Style) */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-3 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
              Topic Frequency
            </h3>
            <p className="text-[11px] text-neutral-500">Top discussion subjects & mentions</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicTopics} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#475569" fontSize={9} allowDecimals={false} />
                <YAxis dataKey="keyword" type="category" stroke="#0f172a" fontSize={10} width={80} tick={{ fontWeight: 'bold' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="mentions" radius={[0, 4, 4, 0]}>
                  {dynamicTopics.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fillColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
