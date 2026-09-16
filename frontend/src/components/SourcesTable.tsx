import React from 'react';
import { SourceRecord } from '../types';
import { Radio, ShieldAlert, CheckCircle2, TestTube2, AlertTriangle } from 'lucide-react';

interface SourcesTableProps {
  sources: SourceRecord[];
}

export const SourcesTable: React.FC<SourcesTableProps> = ({ sources }) => {
  return (
    <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-4 space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-app-text tracking-tight">Connected Data Channels</h2>
          </div>
          <p className="text-xs text-app-muted mt-0.5 font-medium">
            Authorized public channels, official APIs, and pipeline ingestion monitors.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Verified Channels</span>
        </div>
      </div>

      {/* Sources Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-app-border text-app-muted font-bold bg-app-bg/50">
              <th className="py-2 px-2.5">Source Name</th>
              <th className="py-2 px-2.5">Identifier / Channel</th>
              <th className="py-2 px-2.5">Platform</th>
              <th className="py-2 px-2.5">Classification</th>
              <th className="py-2 px-2.5">Access Status</th>
              <th className="py-2 px-2.5 text-right">Messages Ingested</th>
              <th className="py-2 px-2.5 text-right">Last Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {sources.map((src) => {
              const isReal = src.data_type === 'REAL_DATA';
              return (
                <tr key={src.source_id} className="hover:bg-app-bg/60 transition-colors">
                  <td className="py-2.5 px-2.5 font-bold text-app-text">
                    {src.source_name}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-[11px] text-app-muted">
                    {src.channel_username || '—'}
                  </td>
                  <td className="py-2.5 px-2.5 font-medium text-app-text">
                    {src.platform}
                  </td>
                  <td className="py-2.5 px-2.5">
                    {isReal ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <span>PUBLIC DATA</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <TestTube2 className="w-3 h-3" />
                        <span>TEST PIPELINE</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5">
                    {src.access_status === 'CONNECTED' && (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Connected (Live)</span>
                      </span>
                    )}
                    {src.access_status === 'AUTHORIZATION_REQUIRED' && (
                      <span
                        className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        title="MTProto Client API credentials required in .env (TELEGRAM_API_ID and TELEGRAM_API_HASH from my.telegram.org)"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Auth Required</span>
                      </span>
                    )}
                    {src.access_status === 'TEST_ONLY' && (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                        <TestTube2 className="w-3.5 h-3.5" />
                        <span>Pipeline Test</span>
                      </span>
                    )}
                    {src.access_status === 'NOT_CONNECTED' && (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>API Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-app-text">
                    {src.messages_collected}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-[11px] text-app-muted font-mono">
                    {src.last_sync_time
                      ? new Date(src.last_sync_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                      : 'Pending Sync'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transparent Technical Disclosure Footnote */}
      <div className="p-2.5 bg-app-bg border border-app-border rounded text-[11px] text-app-muted leading-relaxed">
        <span className="font-semibold text-app-text">Architecture Note: </span>
        The Telegram Bot API cannot read arbitrary public channels without admin rights.
        Authorized public collection uses Telegram's MTProto Client API (<code className="font-mono text-[10px] bg-app-surface px-1 py-0.5 rounded">telethon</code>),
        which requires developer credentials (<code className="font-mono text-[10px] bg-app-surface px-1 py-0.5 rounded">TELEGRAM_API_ID</code> and{' '}
        <code className="font-mono text-[10px] bg-app-surface px-1 py-0.5 rounded">TELEGRAM_API_HASH</code> from{' '}
        <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="text-app-accent hover:underline">
          my.telegram.org
        </a>
        ). Unconnected sources are honestly flagged. Test bot messages are strictly tagged as Pipeline Test Data.
      </div>
    </div>
  );
};
