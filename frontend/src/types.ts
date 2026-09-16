export interface ActiveSource {
  platform: string;
  count: number;
  status: string;
  color: string;
}

export interface SentimentCounts {
  Positive: number;
  Negative: number;
  Neutral: number;
}

export interface TopTrend {
  topic: string;
  keyword?: string;
  mention_count: number;
  growth_rate: number;
}

export interface SourceRecord {
  source_id: string;
  source_name: string;
  platform: string;
  channel_username: string | null;
  access_status: 'CONNECTED' | 'AUTHORIZATION_REQUIRED' | 'TEST_ONLY' | 'NOT_CONNECTED';
  data_type: 'REAL_DATA' | 'TEST_DATA';
  last_collected_message: string | null;
  messages_collected: number;
  last_sync_time: string | null;
  created_at: string;
}

export type PlatformFilter = 'All' | 'Telegram' | 'X';

export interface OverviewData {
  scope?: string;
  platform?: PlatformFilter;
  total_posts: number;
  real_posts_count?: number;
  test_posts_count?: number;
  active_sources: ActiveSource[];
  sentiment_counts: SentimentCounts;
  top_trending_topic: TopTrend;
  last_updated: string;
}

export interface Post {
  post_id: string;
  platform: string;
  user_id: string;
  text: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  data_type?: 'REAL_DATA' | 'TEST_DATA';
  source_name?: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Unanalyzed';
  emotion: 'Joy' | 'Fear' | 'Anger' | 'Sadness' | 'Surprise' | 'Neutral';
  confidence: number;
  analyzed_at?: string;
}

export interface SentimentDistribution {
  name: string;
  value: number;
}

export interface EmotionDistribution {
  emotion: string;
  count: number;
}

export interface TimelineBucket {
  time_bucket: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface SentimentData {
  scope?: string;
  platform?: PlatformFilter;
  sentiment_distribution: SentimentDistribution[];
  emotion_distribution: EmotionDistribution[];
  timeline: TimelineBucket[];
}

export interface TrendItem {
  trend_id: number;
  topic: string;
  keyword: string;
  mention_count: number;
  growth_rate: number;
  detected_at: string;
}

export interface DemographicRecord {
  demographic_id: number;
  platform: string;
  age_group: string;
  location: string;
  language: string;
  professional_interest: string;
  user_count: number;
  analyzed_at: string;
}

export interface DemographicsData {
  demographics: DemographicRecord[];
  languages: { language: string; count: number }[];
  interests: { interest: string; count: number }[];
}

export interface NetworkNode {
  id: string;
  label: string;
  type: string;
  size: number;
  centrality: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
}

export interface NetworkData {
  platform?: PlatformFilter;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  node_count: number;
  edge_count: number;
}
