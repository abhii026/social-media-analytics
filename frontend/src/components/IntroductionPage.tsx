import React from 'react';
import { AlertCircle, Target, Layers, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

interface IntroductionPageProps {
  totalPosts: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

export const IntroductionPage: React.FC<IntroductionPageProps> = ({
  totalPosts,
  onPrevPage,
  onNextPage,
}) => {
  return (
    <div className="max-w-5xl mx-auto py-2 space-y-4">
      {/* Top Capsule Header with Navigation Buttons (Crop Health Style) */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevPage}
          title="Previous Page"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-900 border-2 border-neutral-900 flex items-center justify-center shadow-xs transition cursor-pointer font-black shrink-0"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
        </button>

        <div className="border-2 border-neutral-900 bg-neutral-100 px-6 sm:px-8 py-1 rounded-2xl shadow-xs text-center">
          <h1 className="text-xs sm:text-sm font-black tracking-wider text-neutral-900 uppercase">
            Introduction
          </h1>
        </div>

        <button
          type="button"
          onClick={onNextPage}
          title="Next Page"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-900 border-2 border-neutral-900 flex items-center justify-center shadow-xs transition cursor-pointer font-black shrink-0"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
        </button>
      </div>

      {/* 2x2 Card Grid with Crisp Solid Borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Card 1: Problem Statement */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <h2 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wide">Problem Statement</h2>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              Monitoring high-volume public online discussions across fragmented channels is challenging. Organizations often miss sudden spikes in dissatisfaction, emerging rumors, or shifting sentiment until issues have already escalated.
            </p>
            <ul className="text-xs text-neutral-600 space-y-1 list-disc list-inside font-medium">
              <li>Information scattered across channels without unified analytics</li>
              <li>Manual review fails to capture conversation momentum and emotional tone</li>
              <li>Need for reliable data collection without scraping or fake synthetic metrics</li>
            </ul>
          </div>
        </div>

        {/* Card 2: Objective */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900">
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wide">Objective</h2>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              Build an enterprise-grade social intelligence pipeline that captures, validates, and analyzes public conversations using authorized APIs and NLP models.
            </p>
            <ul className="text-xs text-neutral-600 space-y-1 list-disc list-inside font-medium">
              <li>Ingest official Telegram channels & verified public discussion streams</li>
              <li>Classify sentiment polarity (Positive, Negative, Neutral) and distinct emotions</li>
              <li>Visualize discussion networks, top growing topics, and audience reach</li>
            </ul>
          </div>
        </div>

        {/* Card 3: Summary & Architecture */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900">
                <Layers className="w-4 h-4 text-sky-600" />
              </div>
              <h2 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wide">Architecture Summary</h2>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              Fully decoupled data engineering architecture designed for high integrity and zero mock fallbacks:
            </p>
            <ul className="text-xs text-neutral-600 space-y-1 list-disc list-inside font-medium">
              <li><strong>Ingestion:</strong> Telegram MTProto public channel listener & API feeds</li>
              <li><strong>Persistence:</strong> Relational schema with deduplication & data classification</li>
              <li><strong>Analytics:</strong> VADER NLP, emotion detection, TF-IDF topic detection, NetworkX</li>
              <li><strong>Privacy:</strong> Zero PII logged; only public text and aggregated metrics</li>
            </ul>
          </div>
        </div>

        {/* Card 4: Operational Applications */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900">
                <Building2 className="w-4 h-4 text-neutral-900" />
              </div>
              <h2 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wide">Operational Applications</h2>
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed font-medium">
              Real-world utility across both corporate and public-sector environments:
            </p>
            <ul className="text-xs text-neutral-600 space-y-1 list-disc list-inside font-medium">
              <li><strong>Product Teams:</strong> Track reaction to new releases, identify common feature complaints</li>
              <li><strong>Public Affairs:</strong> Monitor emerging public interest topics and misinformation spread</li>
              <li><strong>Research Teams:</strong> Analyze community narrative dynamics over time</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Stat Box 1 */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-3 text-center shadow-xs">
          <span className="text-2xl font-black text-neutral-900 block">
            {totalPosts}
          </span>
          <span className="text-xs font-bold text-neutral-600 block mt-0.5">Total Records Stored</span>
        </div>

        {/* Stat Box 2 */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-3 text-center shadow-xs">
          <span className="text-base font-black text-neutral-900 block">
            Multi-Source
          </span>
          <span className="text-xs font-bold text-neutral-600 block mt-0.5">Telegram • X</span>
        </div>

        {/* Stat Box 3 */}
        <div className="border-2 border-neutral-900 bg-white rounded-xl p-3 text-center shadow-xs">
          <span className="text-base font-black text-emerald-700 block">
            Pipeline Active
          </span>
          <span className="text-xs font-bold text-neutral-600 block mt-0.5">NLP & NetworkX Engine</span>
        </div>
      </div>
    </div>
  );
};
