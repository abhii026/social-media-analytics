import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Network as NetworkIcon, Users, Zap, Share2 } from 'lucide-react';
import useData from '../api/useData';
import Panel from '../components/Panel';
import NetworkGraph from '../components/NetworkGraph';
import ChartTooltip, { AXIS_STYLE, GRID_STYLE } from '../components/ChartTooltip';
import { LoadingSkeleton, ErrorState } from '../components/States';

export default function Network() {
  const { data, loading, error, refetch } = useData('network');
  const [selectedNodeId, setSelectedNodeId] = useState(1);

  if (loading) return <LoadingSkeleton rows={6} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { summary, clusters, nodes, edges, cascadeTimeline } = data || {};

  return (
    <div className="space-y-6">
      {/* Network KPI Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panel border border-panel-border rounded-panel p-4 shadow-panel">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Identified KOLs
          </div>
          <div className="text-xl font-bold font-display text-white mt-1">
            {summary?.influencersDetected} Nodes
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">High Centrality</div>
        </div>

        <div className="bg-panel border border-panel-border rounded-panel p-4 shadow-panel">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Network Density
          </div>
          <div className="text-xl font-bold font-display text-white mt-1">
            {summary?.networkDensity}
          </div>
          <div className="text-[11px] text-brand-400 mt-1 font-mono">Interconnected Hubs</div>
        </div>

        <div className="bg-panel border border-panel-border rounded-panel p-4 shadow-panel">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Communities
          </div>
          <div className="text-xl font-bold font-display text-white mt-1">
            {summary?.communitiesMapped} Clusters
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">Partitioned Graph</div>
        </div>

        <div className="bg-panel border border-panel-border rounded-panel p-4 shadow-panel">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Cascade Velocity
          </div>
          <div className="text-xl font-bold font-display text-white mt-1">
            4.2x Baseline
          </div>
          <div className="text-[11px] text-amber-400 mt-1 font-mono">Viral Spread Rate</div>
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <Panel
        title="Follower Topology & Influence Flow Graph"
        subtitle="Custom SVG force graph mapping cross-network propagation between key opinion leaders"
        badge="Interactive Canvas"
      >
        <NetworkGraph
          nodes={nodes}
          edges={edges}
          clusters={clusters}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </Panel>

      {/* 8-Hour Information Cascade Timeline Area Chart */}
      <Panel
        title="8-Hour Information Cascade & Narrative Spread"
        subtitle="Tracking how discussion spread across clusters from T0 inception to full adoption"
        badge="Diffusion Model"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cascadeTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cTech" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cPolicy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cClimate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cFinance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="hour" {...AXIS_STYLE} />
              <YAxis unit="%" {...AXIS_STYLE} />
              <Tooltip content={<ChartTooltip unit="%" />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Area type="monotone" dataKey="techCluster" name="AI & Tech Founders" stroke="#22d3ee" strokeWidth={2} fill="url(#cTech)" />
              <Area type="monotone" dataKey="policyCluster" name="Policy Analysts" stroke="#818cf8" strokeWidth={2} fill="url(#cPolicy)" />
              <Area type="monotone" dataKey="climateCluster" name="Climate Advocates" stroke="#34d399" strokeWidth={2} fill="url(#cClimate)" />
              <Area type="monotone" dataKey="financeCluster" name="Fintech & Angels" stroke="#f59e0b" strokeWidth={2} fill="url(#cFinance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Opinion Leaders Ranking Table */}
      <Panel
        title="Top 10 Key Opinion Leaders (KOLs)"
        subtitle="Ranked by network eigenvector centrality and propagation power"
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Influencer</th>
                <th className="py-3 px-3">Domain Cluster</th>
                <th className="py-3 px-3">Audience Size</th>
                <th className="py-3 px-3">Influence Index</th>
                <th className="py-3 px-3">Active Links</th>
                <th className="py-3 px-3">Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {nodes?.map((node, idx) => (
                <tr
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedNodeId === node.id ? 'bg-cyan-500/10' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{node.avatar}</span>
                      <div>
                        <div className="font-semibold text-white tracking-tight">{node.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{node.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {node.category}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    {node.followers}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${node.influence}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-cyan-400">{node.influence}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {node.connections}
                  </td>
                  <td className="py-3 px-3">
                    <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {node.platform}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
