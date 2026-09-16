import { useState, useEffect, useCallback } from 'react';
import { Navbar, PageId } from './components/Navbar';
import { IntroductionPage } from './components/IntroductionPage';
import { OverviewPage } from './components/OverviewPage';
import { ConversationAnalysisPage } from './components/ConversationAnalysisPage';
import { NetworkAudiencePage } from './components/NetworkAudiencePage';
import {
  fetchOverview,
  fetchPosts,
  fetchSentiment,
  fetchTrends,
  fetchDemographics,
  fetchNetwork,
} from './api';
import {
  OverviewData,
  Post,
  SentimentData,
  TrendItem,
  DemographicsData,
  NetworkData,
  PlatformFilter,
} from './types';
import { AlertCircle } from 'lucide-react';

export function App() {
  // Navigation & Data Filter state
  const [currentPage, setCurrentPage] = useState<PageId>('introduction');
  const dataScope = 'all';
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>('All');
  const isAutoRefreshing = true;
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [network, setNetwork] = useState<NetworkData | null>(null);

  // Lock application permanently to clean Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    try {
      localStorage.removeItem('theme');
    } catch {}
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [ovRes, postsRes, sentRes, trendsRes, demoRes, netRes] = await Promise.allSettled([
        fetchOverview(dataScope, selectedPlatform),
        fetchPosts(50, dataScope, selectedPlatform),
        fetchSentiment(dataScope, selectedPlatform),
        fetchTrends(dataScope, selectedPlatform),
        fetchDemographics(),
        fetchNetwork(dataScope, selectedPlatform),
      ]);

      if (ovRes.status === 'fulfilled') setOverview(ovRes.value);
      if (postsRes.status === 'fulfilled') setPosts(postsRes.value);
      if (sentRes.status === 'fulfilled') setSentiment(sentRes.value);
      if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value);
      if (demoRes.status === 'fulfilled') setDemographics(demoRes.value);
      if (netRes.status === 'fulfilled') setNetwork(netRes.value);

      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to connect to backend service');
      }
    }
  }, [dataScope, selectedPlatform]);

  // Initial and on-scope-change load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Periodic background refresh every 5 seconds
  useEffect(() => {
    if (!isAutoRefreshing) return;
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoRefreshing, loadData]);


  const pageOrder: PageId[] = ['introduction', 'overview', 'conversations', 'network'];

  const handlePrevPage = () => {
    setCurrentPage((prev) => {
      const idx = pageOrder.indexOf(prev);
      return pageOrder[(idx - 1 + pageOrder.length) % pageOrder.length];
    });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => {
      const idx = pageOrder.indexOf(prev);
      return pageOrder[(idx + 1) % pageOrder.length];
    });
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-2.5">
        {error && (
          <div className="mb-3 p-2 bg-app-negative/10 border border-app-negative/20 rounded-lg flex items-center space-x-2 text-xs text-app-negative">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Connection note: {error}. Backend API running on port 8000.</span>
          </div>
        )}

        {/* Dynamic Page Views */}
        {currentPage === 'introduction' && (
          <IntroductionPage
            totalPosts={overview?.total_posts || posts.length}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        )}

        {currentPage === 'overview' && (
          <OverviewPage
            overview={overview}
            posts={posts}
            sentiment={sentiment}
            trends={trends}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        )}

        {currentPage === 'conversations' && (
          <ConversationAnalysisPage
            posts={posts}
            sentiment={sentiment}
            trends={trends}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        )}

        {currentPage === 'network' && (
          <NetworkAudiencePage
            demographics={demographics}
            network={network}
            selectedPlatform={selectedPlatform}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t-2 border-neutral-300 bg-app-surface py-2 px-4 text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span className="font-extrabold text-neutral-900">Social Media Analytics Platform</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
