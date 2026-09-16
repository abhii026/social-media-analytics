import React from 'react';
import { DemographicsData } from '../types';
import { Globe, Users, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DemographicsViewProps {
  data: DemographicsData | null;
}

const PALETTE = ['#525252', '#737373', '#a3a3a3', '#16a34a', '#d97706'];

export const DemographicsView: React.FC<DemographicsViewProps> = ({ data }) => {
  if (!data) return null;

  const tooltipStyle = {
    backgroundColor: '#171717',
    borderColor: '#262626',
    borderRadius: '0.375rem',
    fontSize: '11px',
    color: '#fafafa',
  };

  return (
    <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            Anonymized Demographics & Focus Areas
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">High-level aggregates inferred from content</p>
        </div>
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 text-[11px]">
          <Shield className="w-3 h-3 text-neutral-400" />
          <span>Zero PII / Aggregated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Languages Breakdown */}
        <div className="bg-[#fafafa] dark:bg-[#17181a] border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5">
          <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            Language Distribution
          </h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.languages}>
                <XAxis dataKey="language" stroke="#737373" fontSize={10} />
                <YAxis stroke="#737373" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.languages.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Areas Table */}
        <div className="bg-[#fafafa] dark:bg-[#17181a] border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
              Focus Segments
            </h4>
            <div className="space-y-2">
              {data.demographics.slice(0, 4).map((rec, i) => (
                <div
                  key={rec.demographic_id || i}
                  className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 text-xs"
                >
                  <div>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {rec.professional_interest || rec.age_group}
                    </span>
                    <span className="text-neutral-400 dark:text-neutral-500 block text-[11px]">
                      {rec.location} • {rec.platform}
                    </span>
                  </div>
                  <span className="font-mono text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[11px]">
                    {rec.user_count} posts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
            Aggregated in compliance with privacy regulations. Individual profiles or private communications are never logged.
          </p>
        </div>
      </div>
    </div>
  );
};
