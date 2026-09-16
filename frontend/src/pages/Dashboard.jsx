import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { ArrowUpRight, Radio, TrendingUp, Layers, Share2 } from 'lucide-react';
import useData from '../api/useData';
import Panel from '../components/Panel';
import StatStrip from '../components/StatStrip';
import ChartTooltip, { AXIS_STYLE, GRID_STYLE, formatCompactNumber } from '../components/ChartTooltip';
import NetworkGraph from '../components/NetworkGraph';
import { LoadingSkeleton, ErrorState } from '../components/States';

export default function Dashboard() {
  const { data, loading, error, refetch } = useData('overview');

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { stats, timeline, platformBreakdown, topNarratives } = data || {};

  return (
    <div className="space-y-6">
      {/* 4 Big Numbers */}
      <StatStrip stats={stats} />

      {/* Main Charts Row: Dual Volume/Sentiment Timeline & Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <Panel
          title="Conversation Timeline & Sentiment Dynamics"
          subtitle="Hourly ingestion volume overlaid with real-time sentiment distribution"
          badge="Live Feed"
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                Volume
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Positive %
              </span>
            </div>
          }
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="timestamp" {...AXIS_STYLE} />
                <YAxis yAxisId="left" tickFormatter={formatCompactNumber} {...AXIS_STYLE} />
                <YAxis yAxisId="right" orientation="right" unit="%" {...AXIS_STYLE} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="volume"
                  name="Post Volume"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#volGrad)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="positive"
                  name="Positive Sentiment"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#posGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Platform Share Pie Chart */}
        <Panel
          title="Multi-Platform Ingestion Share"
          subtitle="Distribution of 1.24M records across platforms"
          className="lg:col-span-1"
        >
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="count"
                  stroke="none"
                >
                  {platformBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip unit=" posts" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800">
            {platformBreakdown?.map((item) => (
              <div key={item.platform} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.platform}</span>
                <span className="ml-auto font-mono text-slate-300 font-semibold">{item.share}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Second Row: Top Narratives & Influence Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Narratives */}
        <Panel
          title="Top Emerging Narratives"
          subtitle="Ranked discussions captivating community attention right now"
          action={
            <Link
              to="/trends"
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium transition-colors"
            >
              View all trends <ArrowUpRight size={14} />
            </Link>
          }
        >
          <div className="divide-y divide-slate-800/80">
            {topNarratives?.map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono font-bold text-slate-500 text-xs">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white tracking-tight">
                      {item.topic}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="uppercase font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {item.platform}
                      </span>
                      <span>{item.volume} posts</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                    <TrendingUp size={12} />
                    {item.growth}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.sentiment}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Network Graph Compact Preview */}
        <Panel
          title="Influence & Opinion Leader Map"
          subtitle="Top key nodes driving information spread across follower networks"
          action={
            <Link
              to="/network"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
            >
              Full topology <Share2 size={13} />
            </Link>
          }
        >
          <NetworkGraph compact={true} />
        </Panel>
      </div>
    </div>
  );
}
