import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Zap, Sparkles, Hash } from 'lucide-react';
import useData from '../api/useData';
import Panel from '../components/Panel';
import ChartTooltip, { AXIS_STYLE, GRID_STYLE, formatCompactNumber } from '../components/ChartTooltip';
import { LoadingSkeleton, ErrorState } from '../components/States';

export default function Trends() {
  const { data, loading, error, refetch } = useData('trends');

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { trendList, velocityTimeline, keywords } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Velocity Trends Line Chart */}
      <Panel
        title="Hourly Trend Velocity Acceleration"
        subtitle="Tracking the acceleration rate (new posts/hour) across top 5 emerging discussions"
        badge="Multi-Topic Tracking"
      >
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocityTimeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="time" {...AXIS_STYLE} />
              <YAxis tickFormatter={formatCompactNumber} {...AXIS_STYLE} />
              <Tooltip content={<ChartTooltip unit="/hr" />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="aiRevolution" name="#AIRevolution" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="climateAction" name="#ClimateActionNow" stroke="#34d399" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="budget" name="Budget Policy 2025" stroke="#f43f5e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="startup" name="#StartupEcosystem" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="chips" name="#SemiconductorHub" stroke="#fbbf24" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Keyword Cloud & Tag Cluster */}
      <Panel
        title="Trending Keyword Cloud & Narrative Density"
        subtitle="Algorithmic weighting of extracted phrases from public posts, bios, and comment threads"
      >
        <div className="flex flex-wrap gap-2.5 items-center justify-center p-4 min-h-[140px] bg-dark-900/60 rounded-xl border border-slate-800/80">
          {keywords?.map((kw, i) => {
            const size = Math.max(12, Math.min(22, 11 + (kw.weight / 100) * 11));
            const isPositive = kw.sentiment === 'positive' || kw.sentiment === 'supportive';
            const isCritical = kw.sentiment === 'critical';

            return (
              <span
                key={i}
                style={{ fontSize: `${size}px` }}
                className={`px-3 py-1.5 rounded-full font-medium transition-all duration-200 cursor-default hover:scale-105 select-none ${
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : isCritical
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                #{kw.text}
                <span className="text-[10px] ml-1.5 opacity-60 font-mono">
                  {kw.weight}
                </span>
              </span>
            );
          })}
        </div>
      </Panel>

      {/* Full Ranked Trends Table */}
      <Panel
        title="Ranked Emerging Narratives"
        subtitle="Sorted by real-time composite score (volume × velocity × sentiment acceleration)"
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Narrative Topic</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Volume</th>
                <th className="py-3 px-3">Velocity</th>
                <th className="py-3 px-3">24h Growth</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {trendList?.map((t) => (
                <tr key={t.rank} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">
                    #{t.rank}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white tracking-tight">
                    {t.topic}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {t.category}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {t.volume.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-400">
                    {t.velocity}/hr
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        t.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {t.growth >= 0 ? '+' : ''}{t.growth}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.platform}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        t.status === 'Viral Breakout'
                          ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                          : t.status === 'Rising'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
