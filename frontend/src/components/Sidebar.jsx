import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Heart,
  Users,
  Share2,
  Sparkles,
  Activity,
  Radio,
} from 'lucide-react';

export const LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & timeline' },
  { path: '/trends', label: 'Trends', icon: TrendingUp, desc: 'Growth & velocity' },
  { path: '/sentiment', label: 'Sentiment', icon: Heart, desc: 'Emotions & sarcasm' },
  { path: '/audience', label: 'Audience', icon: Users, desc: 'Demographics & geo' },
  { path: '/network', label: 'Network', icon: Share2, desc: 'Influence topology' },
  { path: '/insights', label: 'Insights', icon: Sparkles, desc: 'AI decision intel' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Mobile background overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-dark-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-brand-500 flex items-center justify-center text-white shadow-glow-cyan shrink-0">
            <Activity size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-base tracking-tight leading-none">
              Social AI
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-medium mt-1">
              Audience Intel
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
            Framework Views
          </div>

          {LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-500/15 text-white border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-brand-400'
                          : 'text-slate-400 group-hover:text-slate-200 transition-colors'
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="leading-none">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">
                        {item.desc}
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-glow-purple" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Live Ingestion Pipeline Status Indicator */}
        <div className="p-4 border-t border-slate-800/80 bg-dark-950/40">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300">Live Ingestion Active</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <Radio size={12} className="text-cyan-400" />
            <span>X, TG, IG, RD, FB, YT</span>
          </div>
        </div>
      </aside>
    </>
  );
}
