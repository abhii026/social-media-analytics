import { TrendingUp, TrendingDown, MessageSquare, Users, Zap, Heart } from 'lucide-react';

const STAT_ICONS = {
  posts: MessageSquare,
  users: Users,
  trends: Zap,
  sentiment: Heart,
};

const STAT_COLORS = {
  posts: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  users: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
  trends: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  sentiment: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function StatStrip({ stats = [] }) {
  if (!stats || !stats.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = STAT_ICONS[item.id] || MessageSquare;
        const colorClass = STAT_COLORS[item.id] || 'text-slate-400 bg-slate-800 border-slate-700';
        const isPositive = item.trend === 'up';

        return (
          <div
            key={item.id}
            className="bg-panel border border-panel-border rounded-panel p-5 shadow-panel flex flex-col justify-between transition-all duration-200 hover:border-slate-700/80 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {item.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-110 ${colorClass}`}
              >
                <Icon size={16} />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 mt-1">
              <div className="text-2xl font-bold font-display text-white tracking-tight">
                {item.value}
              </div>

              {item.change && (
                <div
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isPositive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{item.change}</span>
                </div>
              )}
            </div>

            {item.note && (
              <div className="text-[11px] text-slate-400 mt-2">
                {item.note}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
