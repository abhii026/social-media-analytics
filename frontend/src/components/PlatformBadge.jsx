import './PlatformBadge.css';

const platformLabels = {
  twitter: 'Twitter/X',
  telegram: 'Telegram',
  instagram: 'Instagram',
  reddit: 'Reddit',
  youtube: 'YouTube',
  facebook: 'Facebook',
};

export default function PlatformBadge({ platform }) {
  return (
    <span className={`platform-badge ${platform}`}>
      <span className="platform-badge-dot" />
      {platformLabels[platform] || platform}
    </span>
  );
}
