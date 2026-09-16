import React from 'react';
import { TrendItem } from '../types';
import { TrendingUp, Hash, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TrendsViewProps {
  trends: TrendItem[];
}

export const TrendsView: React.FC<TrendsViewProps> = ({ trends }) => {
  const maxMentions = Math.max(...trends.map((t) => t.mention_count), 1);

  return (
    <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            Trending Keywords
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Frequency and relative growth rate</p>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono">
          {trends.length} tracked
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {trends.length === 0 ? (
          <p className="text-xs text-neutral-500 col-span-2 text-center py-6">No trends calculated yet.</p>
        ) : (
          trends.slice(0, 10).map((trend, idx) => {
            const pct = Math.round((trend.mention_count / maxMentions) * 100);
            const isPositiveGrowth = trend.growth_rate > 0;
            const isNeutralGrowth = trend.growth_rate === 0;

            return (
              <div
                key={trend.trend_id || idx}
                className="bg-[#fafafa] dark:bg-[#17181a] border border-neutral-200 dark:border-neutral-800 rounded-md p-3 transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-neutral-400 w-4">#{idx + 1}</span>
                    <span className="font-medium text-xs text-neutral-900 dark:text-neutral-100 flex items-center">
                      <Hash className="w-3 h-3 mr-0.5 text-neutral-400" />
                      {trend.keyword}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                      {trend.mention_count} {trend.mention_count === 1 ? 'mention' : 'mentions'}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium flex items-center ${
                        isPositiveGrowth
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          : isNeutralGrowth
                          ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                      }`}
                    >
                      {isPositiveGrowth ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : isNeutralGrowth ? null : (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      )}
                      {trend.growth_rate > 0 ? `+${trend.growth_rate}%` : `${trend.growth_rate}%`}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1 mb-2 overflow-hidden">
                  <div
                    className="bg-neutral-700 dark:bg-neutral-300 h-1 rounded-full"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  Topic: <span className="text-neutral-700 dark:text-neutral-300">{trend.topic}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
