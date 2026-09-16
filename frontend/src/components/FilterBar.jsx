import { Search, X, Calendar, Filter } from 'lucide-react';
import { useFilters, PLATFORMS, DATE_RANGES } from '../context/FilterContext';

export default function FilterBar() {
  const {
    platform,
    setPlatform,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
  } = useFilters();

  return (
    <div className="w-full bg-dark-900/80 border-b border-slate-800/80 backdrop-blur-md sticky top-16 z-20 px-4 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Platform Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Filter size={12} />
            Source:
          </span>
          {PLATFORMS.map((p) => {
            const isActive = platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80'
                }`}
              >
                {p.short || p.label}
              </button>
            );
          })}
        </div>

        {/* Date range & Search input */}
        <div className="flex items-center gap-2.5 self-end md:self-auto w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 md:w-60">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search narrative, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Date range chips */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800 shrink-0">
            <Calendar size={13} className="text-slate-400 ml-1 mr-0.5" />
            {DATE_RANGES.map((d) => {
              const isActive = dateRange === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDateRange(d.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.id.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
