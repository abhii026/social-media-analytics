import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export function LoadingSkeleton({ className = 'h-48', rows = 3 }) {
  return (
    <div className={`w-full flex flex-col justify-center gap-3 animate-pulse p-4 ${className}`}>
      <div className="h-4 bg-slate-800/80 rounded w-1/3"></div>
      <div className="h-8 bg-slate-800/50 rounded w-full"></div>
      <div className="h-24 bg-slate-800/30 rounded w-full"></div>
      {rows > 3 && <div className="h-12 bg-slate-800/20 rounded w-4/5"></div>}
    </div>
  );
}

export function EmptyState({
  title = 'No data available',
  message = 'Try changing your active platform or time range filters.',
  onReset,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
      <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 mb-3">
        <Inbox size={22} />
      </div>
      <h4 className="text-sm font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{message}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="text-xs px-3 py-1.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30 hover:bg-brand-500/30 transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  error = 'Failed to load data',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
        <AlertCircle size={22} />
      </div>
      <h4 className="text-sm font-semibold text-rose-300 mb-1">Error Loading Data</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={13} />
          Try Again
        </button>
      )}
    </div>
  );
}
