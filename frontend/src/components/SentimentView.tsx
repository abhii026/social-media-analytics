import React from 'react';
import { SentimentData } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

interface SentimentViewProps {
  data: SentimentData | null;
}

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#16a34a',
  Negative: '#dc2626',
  Neutral: '#737373',
};

const EMOTION_COLORS: Record<string, string> = {
  Joy: '#d97706',
  Fear: '#7c3aed',
  Anger: '#ef4444',
  Sadness: '#6b7280',
  Surprise: '#db2777',
  Neutral: '#525252',
};

export const SentimentView: React.FC<SentimentViewProps> = ({ data }) => {
  if (!data) return null;

  const tooltipStyle = {
    backgroundColor: '#171717',
    borderColor: '#262626',
    borderRadius: '0.375rem',
    fontSize: '11px',
    color: '#fafafa',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* 1. Sentiment Distribution (Donut Chart) */}
      <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5">Sentiment Polarity</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Positive vs Negative vs Neutral</p>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.sentiment_distribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.sentiment_distribution.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={SENTIMENT_COLORS[entry.name] || '#737373'}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Emotion Breakdown (Bar Chart) */}
      <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5">Emotional Tone</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">NLP emotion distribution</p>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.emotion_distribution} layout="vertical" margin={{ left: 5, right: 15 }}>
              <XAxis type="number" stroke="#737373" fontSize={10} allowDecimals={false} />
              <YAxis dataKey="emotion" type="category" stroke="#737373" fontSize={11} width={55} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.emotion_distribution.map((entry) => (
                  <Cell
                    key={`emotion-${entry.emotion}`}
                    fill={EMOTION_COLORS[entry.emotion] || '#737373'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Sentiment Timeline (Area Chart) */}
      <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5">Volume Timeline</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Hourly message distribution</p>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeline} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <XAxis dataKey="time_bucket" stroke="#737373" fontSize={10} tickFormatter={(str) => str.split(' ')[1] || str} />
              <YAxis stroke="#737373" fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.5} />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.5} />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#737373" fill="#737373" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
