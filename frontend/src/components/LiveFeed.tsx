import React from 'react';
import { Post } from '../types';
import { MessageSquare, Heart, MessageCircle, Share2, Clock } from 'lucide-react';

interface LiveFeedProps {
  posts: Post[];
  isLoading: boolean;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ posts, isLoading }) => {
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Negative':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
    }
  };

  const getEmotionBadge = (emotion: string) => {
    switch (emotion) {
      case 'Joy':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'Fear':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      case 'Anger':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800';
      case 'Sadness':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700';
    }
  };

  return (
    <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm flex flex-col h-[560px] transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Live Telegram Feed
          </h2>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          {posts.length} messages
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {posts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 space-y-2">
            <MessageSquare className="w-7 h-7 stroke-[1.5]" />
            <p className="text-xs">No messages recorded yet.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.post_id}
              className="bg-[#fafafa] dark:bg-[#17181a] border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-xs transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                    {post.post_id}
                  </span>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    ID: ***{post.user_id ? post.user_id.slice(-4) : 'ANON'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getSentimentBadge(post.sentiment)}`}>
                    {post.sentiment}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getEmotionBadge(post.emotion)}`}>
                    {post.emotion}
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono" title="Confidence score">
                    {Math.round((post.confidence || 0.5) * 100)}%
                  </span>
                </div>
              </div>

              <p className="text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed mb-2.5 break-words">
                {post.text}
              </p>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-neutral-400" /> {post.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-neutral-400" /> {post.comments}</span>
                  <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-neutral-400" /> {post.shares}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isLoading && (
        <div className="text-center py-1 text-[11px] text-neutral-400">
          Syncing...
        </div>
      )}
    </div>
  );
};
