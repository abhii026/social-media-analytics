import { createContext, useContext, useState, useMemo } from 'react';

const FilterContext = createContext(null);

export const PLATFORMS = [
  { id: 'all', label: 'All Networks', short: 'All' },
  { id: 'x', label: 'X (Twitter)', short: 'X' },
  { id: 'telegram', label: 'Telegram', short: 'TG' },
  { id: 'instagram', label: 'Instagram', short: 'IG' },
  { id: 'reddit', label: 'Reddit', short: 'RD' },
  { id: 'facebook', label: 'Facebook', short: 'FB' },
  { id: 'youtube', label: 'YouTube', short: 'YT' },
];

export const DATE_RANGES = [
  { id: '24h', label: 'Last 24 Hours' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
];

export function FilterProvider({ children }) {
  const [platform, setPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');

  const value = useMemo(
    () => ({
      platform,
      setPlatform,
      dateRange,
      setDateRange,
      searchQuery,
      setSearchQuery,
    }),
    [platform, dateRange, searchQuery]
  );

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used inside <FilterProvider>');
  }
  return context;
}
