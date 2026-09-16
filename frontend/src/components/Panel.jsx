export default function Panel({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
}) {
  return (
    <div
      className={`bg-panel border border-panel-border rounded-panel p-5 shadow-panel transition-all duration-200 hover:border-slate-700/60 flex flex-col ${className}`}
    >
      {(title || subtitle || action || badge) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              {title && (
                <h3 className="text-base font-semibold text-white tracking-tight">
                  {title}
                </h3>
              )}
              {badge && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/30">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 font-normal">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="flex-1 min-h-0 w-full">{children}</div>
    </div>
  );
}
