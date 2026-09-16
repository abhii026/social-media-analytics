import React from 'react';

export type PageId = 'introduction' | 'overview' | 'conversations' | 'network';

export const Navbar: React.FC = () => {
  return (
    <header className="bg-app-surface border-b-2 border-neutral-300 sticky top-0 z-30 px-3 lg:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-center py-2.5">
        <span className="font-black text-base sm:text-lg tracking-wider text-neutral-900 uppercase">
          Social Media Analysis
        </span>
      </div>
    </header>
  );
};
