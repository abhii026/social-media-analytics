import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Users, Globe, MessageSquare, Briefcase } from 'lucide-react';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import {
  ageDistribution, geoDistribution, languageDistribution,
  interestDistribution, activeHoursData,
} from '../data/mockData';
import './AudiencePage.css';

const chartTooltipStyle = {
  backgroundColor: 'rgba(15, 17, 23, 0.95)',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: '#e2e8f0',
  fontSize: '0.8rem',
};

const interestColors = ['#22d3ee', '#a78bfa', '#34d399', '#fb7185', '#fbbf24', '#60a5fa'];

function getHeatmapColor(value) {
  if (value >= 80) return 'rgba(34, 211, 238, 0.6)';
  if (value >= 60) return 'rgba(34, 211, 238, 0.4)';
  if (value >= 40) return 'rgba(34, 211, 238, 0.25)';
  if (value >= 20) return 'rgba(34, 211, 238, 0.12)';
  return 'rgba(148, 163, 184, 0.06)';
}

const hourLabels = ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM'];
const hourKeys = ['h6', 'h9', 'h12', 'h15', 'h18', 'h21', 'h0'];

export default function AudiencePage() {
  return (
    <div className="audience-page animate-fade-in">
      {/* Header */}
      <div className="audience-header">
        <h1>Audience Demographics</h1>
        <p className="audience-header-sub">Automated demographic profiling from public profile indicators and behavioral patterns</p>
      </div>

      {/* Quick Stats */}
      <div className="grid-4 stagger-children">
        <StatCard icon={Users} label="Total Audience" value="248K" change={8.3} trend="up" accent="cyan" />
        <StatCard icon={Globe} label="Countries Reached" value="42" change={5.1} trend="up" accent="purple" />
        <StatCard icon={MessageSquare} label="Languages Detected" value="18" change={12.0} trend="up" accent="emerald" />
        <StatCard icon={Briefcase} label="Top Interest" value="Tech" change={3.4} trend="up" accent="amber" />
      </div>

      {/* Age Distribution + Geographic */}
      <div className="audience-charts-row">
        <ChartCard title="Age Distribution" subtitle="Inferred age brackets from profile data">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
              <XAxis dataKey="bracket" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]} fill="url(#ageGrad)" name="Percentage">
                <defs>
                  <linearGradient id="ageGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Geographic Distribution" subtitle="Top countries by user count">
          <table className="geo-table">
            <tbody>
              {geoDistribution.map((geo, i) => (
                <tr key={i}>
                  <td>
                    <span className="geo-flag">{geo.flag}</span>
                    <span className="geo-country">{geo.country}</span>
                  </td>
                  <td className="geo-users">{geo.users}</td>
                  <td>
                    <div className="geo-bar-wrap">
                      <div className="geo-bar" style={{ width: `${(geo.percentage / 38) * 100}%` }} />
                    </div>
                  </td>
                  <td className="geo-percentage">{geo.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>
      </div>

      {/* Language + Interests */}
      <div className="audience-charts-row">
        <ChartCard title="Language Distribution" subtitle="Primary languages detected">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={languageDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                label={({ language, value }) => `${language} ${value}%`}
              >
                {languageDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Professional Interests" subtitle="Inferred from bio text and engagement patterns">
          <div className="interest-bars">
            {interestDistribution.map((item, i) => (
              <div key={i} className="interest-item">
                <span className="interest-label">{item.interest}</span>
                <div className="interest-bar-wrap">
                  <div
                    className="interest-bar"
                    style={{
                      width: `${item.percentage}%`,
                      background: interestColors[i],
                    }}
                  />
                </div>
                <span className="interest-value">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Active Hours Heatmap */}
      <ChartCard title="Activity Heatmap" subtitle="When your audience is most active (intensity %)">
        <div className="heatmap-grid">
          {/* Header row */}
          <div className="heatmap-label" />
          {hourLabels.map((h) => (
            <div key={h} className="heatmap-label">{h}</div>
          ))}
          {/* Data rows */}
          {activeHoursData.map((row) => (
            <>
              <div key={row.day} className="heatmap-label">{row.day}</div>
              {hourKeys.map((key) => (
                <div
                  key={`${row.day}-${key}`}
                  className="heatmap-cell"
                  style={{ background: getHeatmapColor(row[key]) }}
                  title={`${row.day} ${key}: ${row[key]}%`}
                >
                  {row[key]}
                </div>
              ))}
            </>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
