import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { ShieldCheck, Globe, Users, Award, Lock } from 'lucide-react';
import useData from '../api/useData';
import Panel from '../components/Panel';
import ChartTooltip, { AXIS_STYLE, GRID_STYLE, formatCompactNumber } from '../components/ChartTooltip';
import { LoadingSkeleton, ErrorState } from '../components/States';

export default function Audience() {
  const { data, loading, error, refetch } = useData('audience');

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { modelMeta, age, geography, languages, interests } = data || {};

  return (
    <div className="space-y-6">
      {/* Privacy & Statistical Confidence Callout Banner */}
      <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="text-brand-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-brand-300">
              Responsible AI & Anonymized Statistical Inference (SIH Vector C):
            </span>{' '}
            <span className="text-slate-300">
              {modelMeta?.privacyNotice}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-4 bg-dark-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs self-stretch sm:self-auto justify-around sm:justify-start">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-medium">Aggregate Cohort</div>
            <div className="text-sm font-bold text-white font-mono">{modelMeta?.inferredUsers}</div>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <div className="text-[10px] text-slate-500 uppercase font-medium">Model Confidence</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">{modelMeta?.sampleConfidence}</div>
          </div>
        </div>
      </div>

      {/* Row 1: Age Brackets with Confidence & Geographic Heat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Brackets */}
        <Panel
          title="Inferred Age Cohorts"
          subtitle="Estimated from bio vocabulary, profile duration, and activity timing"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={age} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="bracket" {...AXIS_STYLE} />
                <YAxis unit="%" {...AXIS_STYLE} />
                <Tooltip content={<ChartTooltip unit="%" />} />
                <Bar dataKey="share" name="Audience Share" fill="url(#ageGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
            {age?.map((a) => (
              <div key={a.bracket} className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">{a.bracket}</div>
                <div className="text-xs font-semibold text-white mt-0.5">{a.share}%</div>
                <div className="text-[9px] text-emerald-400 mt-0.5">±{a.confidence}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Geographic Distribution */}
        <Panel
          title="Top Geographic Hubs"
          subtitle="Regional distribution with estimate confidence level"
        >
          <div className="space-y-3">
            {geography?.map((geo) => (
              <div key={geo.country} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-[130px]">
                  <span className="text-base">{geo.flag}</span>
                  <span className="font-medium text-slate-200">{geo.country}</span>
                </div>

                <div className="flex-1 bg-slate-800/80 rounded-full h-2 overflow-hidden mx-2">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-brand-500 rounded-full"
                    style={{ width: `${(geo.share / 44) * 100}%` }}
                  />
                </div>

                <div className="flex items-center gap-3 font-mono shrink-0">
                  <span className="text-slate-300 font-semibold">{geo.share}%</span>
                  <span className="text-slate-500 text-[11px]">({geo.users})</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {geo.confidence}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Row 2: Languages & Professional Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Languages Pie */}
        <Panel
          title="Linguistic Breakdown"
          subtitle="Detected posting and bio languages across multi-network threads"
        >
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languages}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="share"
                  stroke="none"
                >
                  {languages?.map((entry, index) => (
                    <Cell key={`lang-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip unit="%" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-800">
            {languages?.map((item) => (
              <div key={item.language} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.language}</span>
                <span className="ml-auto font-mono text-slate-300 font-semibold">{item.share}%</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Professional Interests */}
        <Panel
          title="Inferred Professional & Topic Interests"
          subtitle="Aggregated from public bio tags, pinned repositories, and frequent topics"
        >
          <div className="space-y-3.5">
            {interests?.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{item.category}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-white">{item.share}%</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Conf: {item.confidence}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
