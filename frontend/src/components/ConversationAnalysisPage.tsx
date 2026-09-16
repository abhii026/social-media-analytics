import React, { useState, useMemo } from 'react';
import { Post, SentimentData, TrendItem, PlatformFilter } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ConversationAnalysisPageProps {
  posts: Post[];
  sentiment: SentimentData | null;
  trends: TrendItem[];
  selectedPlatform?: PlatformFilter;
  onSelectPlatform?: (platform: PlatformFilter) => void;
  theme?: 'light' | 'dark';
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

export const ConversationAnalysisPage: React.FC<ConversationAnalysisPageProps> = ({
  posts,
  sentiment,
  selectedPlatform = 'All',
  onSelectPlatform,
  onPrevPage,
  onNextPage,
}) => {
  const [platformFilter, setPlatformFilter] = useState<string>(selectedPlatform);
  const [sentimentFilter, setSentimentFilter] = useState<string>('All');
  const [emotionFilter, setEmotionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  React.useEffect(() => {
    setPlatformFilter(selectedPlatform);
  }, [selectedPlatform]);

  const handlePlatformChange = (p: string) => {
    setPlatformFilter(p);
    if (onSelectPlatform) {
      onSelectPlatform(p as PlatformFilter);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (platformFilter !== 'All' && post.platform !== platformFilter) return false;
      if (sentimentFilter !== 'All' && post.sentiment !== sentimentFilter) return false;
      if (emotionFilter !== 'All' && post.emotion !== emotionFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        if (!post.text.toLowerCase().includes(q) && !post.post_id.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [posts, platformFilter, sentimentFilter, emotionFilter, searchQuery]);

  const posCount = filteredPosts.filter((p) => p.sentiment === 'Positive').length;
  const negCount = filteredPosts.filter((p) => p.sentiment === 'Negative').length;
  const neuCount = filteredPosts.filter((p) => p.sentiment === 'Neutral').length;

  const emotionColors: Record<string, string> = {
    Joy: '#0284c7',       // Sky Blue (Light)
    Fear: '#f59e0b',      // Amber
    Anger: '#ef4444',     // Coral Red
    Sadness: '#64748b',   // Slate
    Surprise: '#10b981',  // Emerald
    Neutral: '#94a3b8',   // Light Slate
  };

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#1e293b',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#0f172a',
    fontWeight: 'bold',
  };

  const timelineWithTotal = useMemo(() => {
    return (sentiment?.timeline || []).map((item) => ({
      ...item,
      total_volume: (item.positive || 0) + (item.negative || 0) + (item.neutral || 0),
    }));
  }, [sentiment]);

  return (
    <div className="space-y-4">
      {/* Top Capsule Header with Navigation Buttons */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevPage}
          title="Previous Page"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-900 border-2 border-neutral-900 flex items-center justify-center shadow-xs transition cursor-pointer font-black shrink-0"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
        </button>

        <div className="border-2 border-neutral-900 bg-neutral-100 px-6 sm:px-8 py-1.5 rounded-2xl shadow-xs text-center">
          <span className="text-xs sm:text-sm font-black tracking-wider text-neutral-900 uppercase">
            Conversation Analysis
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

      {/* 2. Compact Slicer Filter Row */}
      <div className="border-2 border-neutral-900 bg-white rounded-xl p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Keyword Search */}
          <div className="flex items-center space-x-1.5 flex-1 min-w-[200px]">
            <label htmlFor="search-input" className="text-neutral-700 font-bold">Search:</label>
            <input
              id="search-input"
              type="text"
              placeholder="Filter by keyword or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-1 bg-neutral-100 border border-neutral-400 rounded text-neutral-900 text-xs focus:outline-hidden font-medium"
            />
          </div>

          {/* Platform Filter */}
          <div className="flex items-center space-x-1.5">
            <label htmlFor="conv-platform" className="text-neutral-700 font-bold">Platform:</label>
            <select
              id="conv-platform"
              value={platformFilter}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="px-2 py-1 bg-neutral-100 border border-neutral-400 rounded text-neutral-900 text-xs focus:outline-hidden cursor-pointer font-bold"
            >
              <option value="All">All Platforms</option>
              <option value="Telegram">Telegram</option>
              <option value="X">X</option>
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center space-x-1.5">
            <label htmlFor="conv-sentiment" className="text-app-muted font-medium">Sentiment:</label>
            <select
              id="conv-sentiment"
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="px-2 py-1 bg-app-bg border border-app-border rounded text-app-text text-xs focus:outline-hidden cursor-pointer font-medium"
            >
              <option value="All">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>

          {/* Emotion Filter */}
          <div className="flex items-center space-x-1.5">
            <label htmlFor="conv-emotion" className="text-app-muted font-medium">Emotion:</label>
            <select
              id="conv-emotion"
              value={emotionFilter}
              onChange={(e) => setEmotionFilter(e.target.value)}
              className="px-2 py-1 bg-app-bg border border-app-border rounded text-app-text text-xs focus:outline-hidden cursor-pointer font-medium"
            >
              <option value="All">All Emotions</option>
              <option value="Joy">Joy</option>
              <option value="Fear">Fear</option>
              <option value="Anger">Anger</option>
              <option value="Sadness">Sadness</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>

          {/* Reset */}
          {(platformFilter !== 'All' || sentimentFilter !== 'All' || emotionFilter !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                handlePlatformChange('All');
                setSentimentFilter('All');
                setEmotionFilter('All');
                setSearchQuery('');
              }}
              className="text-app-accent hover:underline text-xs cursor-pointer ml-auto font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Key Metrics (Filtered Summary) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-3.5 shadow-xs">
          <span className="text-xs text-app-muted font-bold block">Filtered Posts</span>
          <span className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 block">{filteredPosts.length}</span>
        </div>
        <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-3.5 shadow-xs">
          <span className="text-xs text-app-muted font-bold block">Positive</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{posCount}</span>
        </div>
        <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-3.5 shadow-xs">
          <span className="text-xs text-app-muted font-bold block">Negative</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">{negCount}</span>
        </div>
        <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-3.5 shadow-xs">
          <span className="text-xs text-app-muted font-bold block">Neutral</span>
          <span className="text-2xl font-black text-zinc-600 dark:text-zinc-300 mt-1 block">{neuCount}</span>
        </div>
      </div>

      {/* 4. Purposeful Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Emotion Breakdown */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-3.5 shadow-xs">
          <h2 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">Emotion Breakdown</h2>
          <p className="text-[11px] text-neutral-500 mb-2">Tone classification extracted from conversations.</p>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentiment?.emotion_distribution || []} layout="vertical" margin={{ left: 5, right: 15 }}>
                <XAxis type="number" stroke="#475569" fontSize={9} allowDecimals={false} />
                <YAxis dataKey="emotion" type="category" stroke="#0f172a" fontSize={10} width={60} tick={{ fontWeight: 'bold' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                  {(sentiment?.emotion_distribution || []).map((entry) => (
                    <Cell
                      key={`emotion-${entry.emotion}`}
                      fill={emotionColors[entry.emotion] || '#888888'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discussion Volume Timeline */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-3.5 shadow-xs">
          <h2 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">Discussion Volume</h2>
          <p className="text-[11px] text-neutral-500 mb-2">Hourly conversation volume to detect spikes.</p>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineWithTotal} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="volTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="volPosGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="volNegGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b91c1c" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#b91c1c" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time_bucket" stroke="#475569" fontSize={9} fontStyle="bold" tickFormatter={(s) => s.split(' ')[1] || s} />
                <YAxis stroke="#475569" fontSize={9} allowDecimals={false} fontStyle="bold" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="total_volume" name="Total Activity" stroke="#1d4ed8" strokeWidth={2.5} fill="url(#volTotalGrad)" />
                <Area type="monotone" dataKey="positive" name="Positive" stroke="#047857" strokeWidth={2} fill="url(#volPosGrad)" />
                <Area type="monotone" dataKey="negative" name="Negative" stroke="#b91c1c" strokeWidth={2} fill="url(#volNegGrad)" />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px', fontWeight: 'bold' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
