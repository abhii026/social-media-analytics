import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { Heart, AlertTriangle, Smile, ShieldAlert, Sparkles } from 'lucide-react';
import useData from '../api/useData';
import Panel from '../components/Panel';
import ChartTooltip, { AXIS_STYLE, GRID_STYLE } from '../components/ChartTooltip';
import { LoadingSkeleton, ErrorState } from '../components/States';

export default function Sentiment() {
  const { data, loading, error, refetch } = useData('sentiment');

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { overall, emotions, timeline, platformSplit, classifiedPosts } = data || {};

  return (
    <div className="space-y-6">
      {/* Sarcasm & NLP Polarity Highlight Alert */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90">
        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">
            Multi-Dimensional Emotion & Sarcasm Engine Active:
          </span>{' '}
          Our NLP pipeline detects nuance like sarcasm, irony, and passive aggression. When a user writes{' '}
          <em>"Oh wonderful, another groundbreaking budget... pure genius"</em>, traditional models classify it as positive.
          Our model correctly recognizes sarcasm and inverts the polarity score to negative (-0.78).
        </div>
      </div>

      {/* Six Emotions Grid */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Nuanced Emotion Breakdown (SIH Vector B)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {emotions?.map((emo, idx) => (
            <div
              key={idx}
              className="bg-panel border border-panel-border rounded-panel p-4 shadow-panel flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white tracking-tight">
                    {emo.name}
                  </span>
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: emo.color }}
                  >
                    {emo.score}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {emo.description}
                </p>
              </div>

              <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${emo.score}%`, backgroundColor: emo.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row: Sentiment Timeline + Per-Platform Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Timeline */}
        <Panel
          title="Sentiment & Sarcasm Trend Over Time"
          subtitle="Fluctuation of positive vs. negative posts alongside sarcasm index"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sentPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="sentNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="date" {...AXIS_STYLE} />
                <YAxis unit="%" {...AXIS_STYLE} />
                <Tooltip content={<ChartTooltip unit="%" />} />
                <Area type="monotone" dataKey="positive" name="Positive %" stroke="#34d399" strokeWidth={2} fill="url(#sentPos)" />
                <Area type="monotone" dataKey="negative" name="Negative %" stroke="#fb7185" strokeWidth={2} fill="url(#sentNeg)" />
                <Area type="monotone" dataKey="sarcasm" name="Sarcasm Index" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Platform Split Bar Chart */}
        <Panel
          title="Platform Sentiment Distribution"
          subtitle="Comparing sentiment variations across X, Telegram, Instagram, Reddit, FB, YT"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformSplit} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="platform" {...AXIS_STYLE} />
                <YAxis unit="%" {...AXIS_STYLE} />
                <Tooltip content={<ChartTooltip unit="%" />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Bar dataKey="positive" name="Positive" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="negative" name="Negative" fill="#fb7185" radius={[4, 4, 0, 0]} />
                <Bar dataKey="neutral" name="Neutral" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Classified Posts Stream */}
      <Panel
        title="Live NLP Classified Post Stream"
        subtitle="Sample ingested messages with detected emotion labels and polarity inference scores"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classifiedPosts?.map((post) => {
            const isNegative = post.score < 0;

            return (
              <div
                key={post.id}
                className="p-4 rounded-xl bg-dark-900 border border-slate-800/90 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{post.avatar}</span>
                      <div>
                        <div className="text-xs font-semibold text-white">{post.user}</div>
                        <div className="text-[10px] text-slate-500 uppercase">{post.platform} • {post.timestamp}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isNegative
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {post.sentiment} ({post.score > 0 ? '+' : ''}{post.score})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    "{post.text}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-brand-400 font-medium">{post.emotion}</span>
                    <span className="text-slate-600">•</span>
                    <span>Confidence: <strong className="text-slate-300 font-mono">{post.confidence}</strong></span>
                  </div>

                  {post.note && (
                    <div className="text-[10px] text-amber-300/80 italic w-full">
                      ⚠️ {post.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
