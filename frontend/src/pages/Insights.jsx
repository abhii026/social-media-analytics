import { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Search,
} from 'lucide-react';
import useData from '../api/useData';
import Panel from '../components/Panel';
import { LoadingSkeleton, ErrorState } from '../components/States';

export default function Insights() {
  const { data, loading, error, refetch } = useData('insights');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [askQuery, setAskQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { meta, findings } = data || {};

  const filteredFindings = findings?.filter((f) => {
    if (filterSeverity === 'all') return true;
    return f.severity === filterSeverity;
  });

  const handleAskCopilot = (e) => {
    e?.preventDefault();
    if (!askQuery.trim()) return;

    setAiAnswer({
      query: askQuery,
      text: `Based on cross-vector analysis of 1.24M records, "${askQuery}" correlates strongly (+84%) with tech founders in urban hubs. Sarcasm detection indicates public trust remains high (78%), though coordinated amplification on Telegram warrants observation. Recommended intervention: Deploy verified factual brief via top 3 KOLs.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Executive Meta Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-dark-900 border border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <BrainCircuit size={18} className="text-brand-400" />
            Decision-Maker Intelligence Feed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synthesis of Sentiment, Trends, Demographics, and Network Influence into concrete operational takeaways
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
          <span className="text-slate-400">Confidence: <strong className="text-emerald-400">{meta?.confidence}</strong></span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{meta?.generatedAt}</span>
        </div>
      </div>

      {/* Social AI Interactive Copilot */}
      <Panel
        title="Social AI Copilot — Query Your Audience Intelligence"
        subtitle="Ask natural language questions across the multi-platform dataset"
        badge="Autonomous Synthesis"
      >
        <form onSubmit={handleAskCopilot} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. What caused the Wednesday sentiment dip? Or which KOL is driving semiconductor adoption?"
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} />
              Run Query
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span className="text-slate-500">Quick tests:</span>
            <button
              type="button"
              onClick={() => setAskQuery('Why did sarcasm spike on Wednesday in Budget posts?')}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
            >
              "Why did sarcasm spike on Wednesday?"
            </button>
            <button
              type="button"
              onClick={() => setAskQuery('Which audience bracket is driving #AIRevolution?')}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
            >
              "Which demographic drives #AIRevolution?"
            </button>
            <button
              type="button"
              onClick={() => setAskQuery('How fast is the semiconductor narrative spreading?')}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
            >
              "How fast is #SemiconductorHub spreading?"
            </button>
          </div>

          {aiAnswer && (
            <div className="p-3.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-xs text-slate-200 mt-3 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-brand-300 text-[11px] uppercase tracking-wider">
                <Sparkles size={13} />
                Copilot Analysis
              </div>
              <p className="leading-relaxed text-slate-300">{aiAnswer.text}</p>
            </div>
          )}
        </form>
      </Panel>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Filter:
        </span>
        {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
              filterSeverity === sev
                ? 'bg-brand-500 text-white font-semibold shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {sev === 'all' ? 'All Findings' : sev}
          </button>
        ))}
      </div>

      {/* Written Findings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFindings?.map((item) => {
          const isCritical = item.severity === 'critical';
          const isHigh = item.severity === 'high';

          return (
            <div
              key={item.id}
              className={`bg-panel border rounded-panel p-5 shadow-panel flex flex-col justify-between gap-4 transition-all duration-200 hover:border-slate-700 ${
                isCritical
                  ? 'border-l-4 border-l-rose-500 border-panel-border'
                  : isHigh
                  ? 'border-l-4 border-l-amber-500 border-panel-border'
                  : 'border-l-4 border-l-cyan-500 border-panel-border'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isCritical
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : isHigh
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white tracking-tight mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Quantitative Evidence:</span>
                  <span className="font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {item.evidence}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-brand-300 text-[11px] mb-1 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Recommended Strategic Action
                  </div>
                  <p className="text-slate-400 text-[11px] leading-normal">
                    {item.recommendation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
