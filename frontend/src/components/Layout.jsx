import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ShieldAlert, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import FilterBar from './FilterBar';

export const PAGE_META = {
  '/dashboard': {
    title: 'Executive Dashboard & Timeline',
    subtitle: 'Simultaneous cross-platform monitoring of conversation volume, sentiment, and active topics',
    question: '① What are people talking about?',
  },
  '/trends': {
    title: 'Real-Time Trend & Topic Detection',
    subtitle: 'Ranked viral narratives, hourly velocity, and emerging keyword clusters',
    question: '② What is becoming popular?',
  },
  '/sentiment': {
    title: 'Multi-Dimensional Sentiment Inference',
    subtitle: 'Fine-grained NLP emotion classification with sarcasm polarity correction',
    question: '③ How do people feel about it?',
  },
  '/audience': {
    title: 'Automated Demographic Profiling',
    subtitle: 'Aggregate statistical inference across age brackets, geography, language, and interests',
    question: '④ Who are the people discussing it?',
  },
  '/network': {
    title: 'Link Analysis & Network Topology',
    subtitle: 'Key opinion leaders, high-centrality influence nodes, and cross-cluster narrative cascades',
    question: '⑤ Who is influencing the discussion?',
  },
  '/insights': {
    title: 'AI Decision Intelligence & Strategic Findings',
    subtitle: 'Automated executive takeaways connecting trend vectors into prioritized interventions',
    question: 'Synthesis: Cross-vector actionable intelligence',
  },
};

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentMeta = PAGE_META[location.pathname] || {
    title: 'Social AI Analytics',
    subtitle: 'Audience Intelligence Platform',
    question: 'SIH Social Media Framework',
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 flex">
      {/* Navigation Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-dark-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-display text-white truncate leading-tight">
                  {currentMeta.title}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  {currentMeta.question}
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-400 truncate">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-950/80 border border-slate-800 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SIH 2025 Team DevOrbit</span>
            </div>
          </div>
        </header>

        {/* Global Filter Bar */}
        <FilterBar />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
