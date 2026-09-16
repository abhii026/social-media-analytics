import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, change, trend, accent = 'cyan' }) {
  return (
    <div className={`stat-card glass-card accent-${accent}`}>
      <div className="stat-card-header">
        <div className={`stat-card-icon ${accent}`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`stat-card-change ${trend}`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
