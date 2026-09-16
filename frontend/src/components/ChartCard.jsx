import { useState } from 'react';
import './ChartCard.css';

export default function ChartCard({ title, subtitle, tabs, children, className = '' }) {
  const [activeTab, setActiveTab] = useState(tabs ? tabs[0] : null);

  return (
    <div className={`chart-card glass-card ${className}`}>
      <div className="chart-card-header">
        <div className="chart-card-title-group">
          <h3>{title}</h3>
          {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
        </div>
        {tabs && (
          <div className="chart-card-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`chart-card-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="chart-card-body">
        {typeof children === 'function' ? children(activeTab) : children}
      </div>
    </div>
  );
}
