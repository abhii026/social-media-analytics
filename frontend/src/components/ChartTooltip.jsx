export const AXIS_STYLE = {
  stroke: '#64748b',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

export const GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: 'rgba(148, 163, 184, 0.08)',
};

export function formatCompactNumber(number) {
  if (number == null || isNaN(number)) return '0';
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}K`;
  return number.toLocaleString();
}

export default function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-dark-900/95 border border-slate-700/60 backdrop-blur-md rounded-lg p-3 shadow-2xl text-xs min-w-[140px]">
      {label && (
        <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5 mb-2">
          {label}
        </div>
      )}
      <div className="space-y-1.5">
        {payload.map((item, index) => {
          const color = item.color || item.fill || '#22d3ee';
          const name = item.name || item.dataKey;
          const val = typeof item.value === 'number'
            ? item.value.toLocaleString()
            : item.value;

          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-400 capitalize">{name}:</span>
              </div>
              <span className="font-medium text-white font-mono">
                {val}
                {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
