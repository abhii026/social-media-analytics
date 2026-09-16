import {
  OverviewData,
  Post,
  SentimentData,
  TrendItem,
  DemographicsData,
  NetworkData,
  SourceRecord,
} from './types';

const API_BASE = '/api';

export async function fetchSources(): Promise<SourceRecord[]> {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  const data = await res.json();
  return data.sources;
}

export async function fetchOverview(scope = 'all', platform = 'All'): Promise<OverviewData> {
  const pQuery = platform !== 'All' ? `&platform=${encodeURIComponent(platform)}` : '';
  const res = await fetch(`${API_BASE}/overview?scope=${scope}${pQuery}`);
  if (!res.ok) throw new Error('Failed to fetch overview');
  return res.json();
}

export async function fetchPosts(limit = 50, scope = 'all', platform = 'All'): Promise<Post[]> {
  const pQuery = platform !== 'All' ? `&platform=${encodeURIComponent(platform)}` : '';
  const res = await fetch(`${API_BASE}/posts?limit=${limit}&scope=${scope}${pQuery}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  const data = await res.json();
  return data.posts;
}

export async function fetchSentiment(scope = 'all', platform = 'All'): Promise<SentimentData> {
  const pQuery = platform !== 'All' ? `&platform=${encodeURIComponent(platform)}` : '';
  const res = await fetch(`${API_BASE}/sentiment?scope=${scope}${pQuery}`);
  if (!res.ok) throw new Error('Failed to fetch sentiment');
  return res.json();
}

export async function fetchTrends(scope = 'all', platform = 'All'): Promise<TrendItem[]> {
  const pQuery = platform !== 'All' ? `&platform=${encodeURIComponent(platform)}` : '';
  const res = await fetch(`${API_BASE}/trends?scope=${scope}${pQuery}`);
  if (!res.ok) throw new Error('Failed to fetch trends');
  const data = await res.json();
  return data.trends;
}

export async function fetchDemographics(): Promise<DemographicsData> {
  const res = await fetch(`${API_BASE}/demographics`);
  if (!res.ok) throw new Error('Failed to fetch demographics');
  return res.json();
}

export async function fetchNetwork(scope = 'all', platform = 'All'): Promise<NetworkData> {
  const pQuery = platform !== 'All' ? `&platform=${encodeURIComponent(platform)}` : '';
  const res = await fetch(`${API_BASE}/network?scope=${scope}${pQuery}`);
  if (!res.ok) throw new Error('Failed to fetch network');
  return res.json();
}

export async function triggerPipeline(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/pipeline/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger pipeline');
  return res.json();
}
