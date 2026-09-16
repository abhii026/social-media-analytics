import { useLocation } from 'react-router-dom';
import { Search, Bell, Filter } from 'lucide-react';
import './TopBar.css';

const pageTitles = {
  '/': { title: 'Dashboard', breadcrumb: 'Overview' },
  '/trends': { title: 'Trends', breadcrumb: 'Trend & Topic Detection' },
  '/sentiment': { title: 'Sentiment', breadcrumb: 'Sentiment Analysis' },
  '/audience': { title: 'Audience', breadcrumb: 'Demographic Profiling' },
  '/network': { title: 'Network', breadcrumb: 'Link Analysis & Influence' },
  '/insights': { title: 'Insights', breadcrumb: 'AI-Generated Intelligence' },
};

export default function TopBar() {
  const location = useLocation();
  const current = pageTitles[location.pathname] || { title: 'Dashboard', breadcrumb: '' };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-page-title">{current.title}</div>
          <div className="topbar-breadcrumb">{current.breadcrumb}</div>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={16} className="topbar-search-icon" />
        <input
          type="text"
          placeholder="Search topics, users, trends..."
          id="global-search"
          aria-label="Global search"
        />
      </div>

      <div className="topbar-right">
        <button className="topbar-platform-filter" id="platform-filter">
          <Filter size={14} />
          All Platforms
        </button>

        <button className="topbar-icon-btn" id="notifications-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="topbar-notification-dot" />
        </button>

        <div className="topbar-avatar" title="User Profile">
          DA
        </div>
      </div>
    </header>
  );
}
