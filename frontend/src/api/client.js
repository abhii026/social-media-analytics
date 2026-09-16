import axios from 'axios';
import { MOCK_DATA } from '../data/mockData';

// Switch to false when backend server is ready!
export const USE_MOCK = true;

// Contract with backend teammates:
export const ROUTES = {
  overview: '/api/overview',
  trends: '/api/trends',
  sentiment: '/api/sentiment',
  audience: '/api/audience',
  network: '/api/network',
  insights: '/api/insights',
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch data for any of the 6 core analytics endpoints
 * @param {string} endpointKey - 'overview' | 'trends' | 'sentiment' | 'audience' | 'network' | 'insights'
 * @param {object} params - { platform, dateRange, search }
 */
export async function fetchAnalyticsData(endpointKey, params = {}) {
  if (USE_MOCK) {
    // Simulate realistic asynchronous network latency (200ms)
    await new Promise((resolve) => setTimeout(resolve, 200));
    const data = MOCK_DATA[endpointKey];
    if (!data) {
      throw new Error(`Endpoint "${endpointKey}" not found in mock data.`);
    }
    return data;
  }

  const route = ROUTES[endpointKey];
  if (!route) {
    throw new Error(`No route defined for "${endpointKey}".`);
  }

  try {
    const response = await apiClient.get(route, { params });
    return response.data;
  } catch (err) {
    console.warn(`[API] Failed to fetch ${route}, falling back to mock data:`, err.message);
    return MOCK_DATA[endpointKey];
  }
}

export default apiClient;
