import React from 'react';
import { OverviewData } from '../types';
import { MessageSquare, Radio, Smile, TrendingUp } from 'lucide-react';

interface OverviewCardsProps {
  data: OverviewData | null;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
  if (!data) return null;

  const totalSentiment =
    (data.sentiment_counts?.Positive || 0) +
    (data.sentiment_counts?.Negative || 0) +
    (data.sentiment_counts?.Neutral || 0);

  const posPct = totalSentiment > 0 ? Math.round(((data.sentiment_counts?.Positive || 0) / totalSentiment) * 100) : 0;
  const negPct = totalSentiment > 0 ? Math.round(((data.sentiment_counts?.Negative || 0) / totalSentiment) * 100) : 0;
  const neuPct = totalSentiment > 0 ? Math.round(((data.sentiment_counts?.Neutral || 0) / totalSentiment) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Posts Card */}
      <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span className="text-xs font-medium uppercase tracking-wider">Total Messages</span>
          <MessageSquare className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">{data.total_posts}</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">stored</span>
        </div>
        <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Deduplicated in MySQL</span>
        </div>
      </div>

      {/* 2. Active Sources Card */}
      <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span className="text-xs font-medium uppercase tracking-wider">Sources</span>
          <Radio className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">1 Active</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">/ 1 Ready</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span className="text-neutral-800 dark:text-neutral-200 font-medium">
            Telegram ({data.active_sources?.find((s) => s.platform === 'Telegram')?.count || 0})
          </span>
          <span className="text-neutral-400 dark:text-neutral-500">X (Inactive)</span>
        </div>
      </div>

      {/* 3. Sentiment Summary Card */}
      <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span className="text-xs font-medium uppercase tracking-wider">Sentiment Ratio</span>
          <Smile className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">{posPct}%</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Positive</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span className="text-emerald-600 dark:text-emerald-400">Pos: {data.sentiment_counts?.Positive || 0} ({posPct}%)</span>
          <span className="text-rose-600 dark:text-rose-400">Neg: {data.sentiment_counts?.Negative || 0} ({negPct}%)</span>
          <span className="text-neutral-500 dark:text-neutral-400">Neu: {data.sentiment_counts?.Neutral || 0} ({neuPct}%)</span>
        </div>
      </div>

      {/* 4. Top Trending Topic Card */}
      <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
          <span className="text-xs font-medium uppercase tracking-wider">Top Trend</span>
          <TrendingUp className="w-4 h-4 text-neutral-400" />
        </div>
        <div className="mt-2">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate" title={data.top_trending_topic?.topic || 'N/A'}>
            {data.top_trending_topic?.topic || 'None detected'}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>{data.top_trending_topic?.mention_count || 0} mentions</span>
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            #{data.top_trending_topic?.keyword || 'none'}
          </span>
        </div>
      </div>
    </div>
  );
};
