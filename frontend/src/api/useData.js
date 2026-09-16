import { useState, useEffect, useCallback } from 'react';
import { fetchAnalyticsData } from './client';
import { useFilters } from '../context/FilterContext';

/**
 * Custom React hook used by every page to fetch analytics data.
 * Automatically synchronizes with the active global platform, date range, and search filters.
 *
 * @param {string} endpointKey - 'overview' | 'trends' | 'sentiment' | 'audience' | 'network' | 'insights'
 */
export function useData(endpointKey) {
  const { platform, dateRange, searchQuery } = useFilters();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalyticsData(endpointKey, {
        platform,
        dateRange,
        search: searchQuery,
      });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [endpointKey, platform, dateRange, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

export default useData;
