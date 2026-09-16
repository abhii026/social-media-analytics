import React, { useState, useMemo } from 'react';
import { DemographicsData, NetworkData, NetworkNode, PlatformFilter } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NetworkAudiencePageProps {
  demographics: DemographicsData | null;
  network: NetworkData | null;
  selectedPlatform?: PlatformFilter;
  theme?: 'light' | 'dark';
  onPrevPage?: () => void;
  onNextPage?: () => void;
}

export const NetworkAudiencePage: React.FC<NetworkAudiencePageProps> = ({
  demographics,
  network,
  selectedPlatform = 'All',
  theme = 'light',
  onPrevPage,
  onNextPage,
}) => {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  // Compute 2D coordinates for nodes in SVG canvas (600x360)
  const layout = useMemo(() => {
    if (!network || network.nodes.length === 0) return { positionedNodes: [], edges: [] };

    const width = 600;
    const height = 360;
    const centerX = width / 2;
    const centerY = height / 2;

    const positionedNodes = network.nodes.map((node, i) => {
      // Hub nodes placed near center
      if (node.type === 'platform') {
        return { ...node, x: centerX - 50, y: centerY };
      }
      if (node.type === 'system' || node.id === 'System' || node.id === 'Platform') {
        return { ...node, x: centerX + 50, y: centerY };
      }

      // Other nodes placed radially around center
      const nonHubIndex = i;
      const angle = (nonHubIndex / Math.max(1, network.nodes.length - 2)) * 2 * Math.PI;
      const radius = 120 + (i % 2 === 0 ? 20 : -15);
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });

    const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

    const validEdges = network.edges
      .map((edge) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return null;
        return {
          ...edge,
          x1: source.x,
          y1: source.y,
          x2: target.x,
          y2: target.y,
          sourceNode: source,
          targetNode: target,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return { positionedNodes, edges: validEdges };
  }, [network]);

  const getNodeColor = (node: NetworkNode) => {
    if (selectedNode?.id === node.id) return '#f59e0b';
    switch (node.type) {
      case 'platform':
        return '#00509d'; // Dark Blue
      case 'system':
        return '#60a5fa'; // Light Blue
      case 'topic':
        return '#16a34a'; // Vibrant Green
      case 'cluster':
        return '#8b5cf6'; // Violet
      default:
        return '#64748b';
    }
  };

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#1e293b',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#0f172a',
    fontWeight: 'bold',
  };

  const barPalette = [
    '#00509d', // Dark Blue
    '#60a5fa', // Light Blue
    '#16a34a', // Vibrant Green
  ];

  const hubName = selectedPlatform !== 'All' ? `${selectedPlatform} Hub` : 'Multi-Source Hub';

  return (
    <div className="space-y-4">
      {/* Top Capsule Header with Navigation Buttons */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevPage}
          title="Previous Page"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-900 border-2 border-neutral-900 flex items-center justify-center shadow-xs transition cursor-pointer font-black shrink-0"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
        </button>

        <div className="border-2 border-neutral-900 bg-neutral-100 px-6 sm:px-8 py-1.5 rounded-2xl shadow-xs text-center">
          <span className="text-xs sm:text-sm font-black tracking-wider text-neutral-900 uppercase">
            Network & Audience
          </span>
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

      {/* 1. Sub-Header */}
      <div>
        <h2 className="text-sm font-semibold text-app-text">Topic & Entity Relationships</h2>
        <p className="text-xs text-app-muted mt-0.5">
          Aggregate language distribution, audience segments, and topic connection topology.
        </p>
      </div>

      {/* 2. Language Distribution & Audience Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language Distribution */}
        <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-4 shadow-xs">
          <h2 className="text-sm font-semibold text-app-text">Language Distribution</h2>
          <p className="text-xs text-app-muted mb-3">Which languages are present in the dataset?</p>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics?.languages || []}>
                <XAxis dataKey="language" stroke={theme === 'dark' ? '#777' : '#999'} fontSize={10} />
                <YAxis stroke={theme === 'dark' ? '#777' : '#999'} fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {(demographics?.languages || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={barPalette[index % barPalette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audience / Topic Segments */}
        <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-app-text">Audience & Topic Segments</h2>
            <p className="text-xs text-app-muted mb-3">Aggregated focus areas inferred from verified messages.</p>

            <div className="space-y-2">
              {(demographics?.demographics || []).slice(0, 3).map((rec, idx) => (
                <div
                  key={rec.demographic_id || idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-app-bg border border-app-border text-xs"
                >
                  <div>
                    <span className="font-medium text-app-text block">
                      {rec.professional_interest || rec.age_group}
                    </span>
                    <span className="text-[11px] text-app-muted">
                      {rec.location} • {rec.platform}
                    </span>
                  </div>
                  <span className="font-mono text-app-text font-semibold px-2 py-0.5 rounded bg-app-surface border border-app-border text-[11px]">
                    {rec.user_count} posts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-app-muted mt-2 pt-2 border-t border-app-border">
            Strictly anonymized aggregates. No personal identifiable information is collected.
          </p>
        </div>
      </div>

      {/* 3. Simple Network Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-3 shadow-xs">
          <span className="text-xs text-app-muted font-medium block">Total Entities (Nodes)</span>
          <span className="text-xl font-bold text-app-text mt-0.5 block">{network?.node_count || 0}</span>
          <span className="text-[11px] text-app-muted block mt-0.5">Keywords, topics & platforms</span>
        </div>

        <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-3 shadow-xs">
          <span className="text-xs text-app-muted font-medium block">Connections (Edges)</span>
          <span className="text-xl font-bold text-app-text mt-0.5 block">{network?.edge_count || 0}</span>
          <span className="text-[11px] text-app-muted block mt-0.5">Co-occurrences in posts</span>
        </div>

        <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-3 shadow-xs">
          <span className="text-xs text-app-muted font-medium block">Active Graph Focus</span>
          <span className="text-xl font-bold text-app-positive mt-0.5 block">{hubName}</span>
          <span className="text-[11px] text-app-muted block mt-0.5">Central conversation anchor</span>
        </div>
      </div>

      {/* 4. Network Graph & Node Details */}
      <div className="border-2 border-neutral-800 dark:border-neutral-800 border-neutral-300 bg-app-surface rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-app-border">
          <div>
            <h2 className="text-sm font-semibold text-app-text">Network Co-Occurrence Graph</h2>
            <p className="text-xs text-app-muted">How are topics and entities connected in conversation?</p>
          </div>
          <span className="text-xs font-mono text-app-muted">
            {layout.positionedNodes.length > 0 ? 'Click any node to inspect details' : 'No nodes'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* SVG Canvas */}
          <div className="lg:col-span-3 bg-app-bg border border-app-border rounded-lg p-2 relative overflow-hidden flex items-center justify-center min-h-[280px]">
            {layout.positionedNodes.length === 0 ? (
              <div className="text-center p-6 text-xs text-app-muted space-y-1">
                <p className="font-semibold text-app-text">No network entities found for {selectedPlatform !== 'All' ? selectedPlatform : 'this scope'}</p>
                <p>Ingest public messages on this platform to map entity connections and co-occurrence graphs.</p>
              </div>
            ) : (
            <svg viewBox="0 0 600 360" className="w-full h-72 select-none">
              {/* Edges */}
              {layout.edges.map((edge, idx) => (
                <line
                  key={`edge-${idx}`}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke={theme === 'dark' ? '#333333' : '#D0D0CA'}
                  strokeWidth={Math.min(2.5, Math.max(1, edge.weight * 0.6))}
                  strokeOpacity={0.7}
                />
              ))}

              {/* Nodes */}
              {layout.positionedNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const radius = Math.max(5, Math.min(14, (node.size || 15) * 0.55));

                return (
                  <g
                    key={`node-${node.id}`}
                    className="cursor-pointer transition-transform duration-100 hover:scale-110"
                    onClick={() => setSelectedNode(node)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={getNodeColor(node)}
                      stroke={isSelected ? (theme === 'dark' ? '#FFFFFF' : '#000000') : (theme === 'dark' ? '#141414' : '#FFFFFF')}
                      strokeWidth={isSelected ? 2 : 1}
                      fillOpacity={0.9}
                    />
                    <text
                      x={node.x}
                      y={node.y + radius + 9}
                      textAnchor="middle"
                      fill={theme === 'dark' ? '#CCCCCC' : '#444444'}
                      fontSize="9"
                      fontFamily="sans-serif"
                      className="pointer-events-none font-medium"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            )}
          </div>

          {/* Node Details Panel */}
          <div className="bg-app-bg border border-app-border rounded p-3 flex flex-col justify-between text-xs">
            <div>
              <h3 className="font-semibold text-app-text mb-2">Node Details</h3>
              {selectedNode ? (
                <div className="space-y-2 p-2.5 bg-app-surface border border-app-border rounded">
                  <div>
                    <span className="text-[10px] text-app-muted uppercase block">Label</span>
                    <span className="font-bold text-app-text">{selectedNode.label}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-app-muted uppercase block">Type</span>
                    <span className="font-mono text-app-accent font-semibold capitalize">{selectedNode.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-app-muted uppercase block">Degree Centrality</span>
                    <span className="font-mono text-app-positive font-bold">{selectedNode.centrality}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-app-muted uppercase block">Connection Weight</span>
                    <span className="font-mono text-app-text">{selectedNode.size}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-app-muted leading-relaxed">
                  Click on any node in the graph to view its centrality score and connection metrics.
                </p>
              )}
            </div>

            {/* Simple Legend */}
            <div className="pt-3 border-t border-app-border space-y-1 text-[11px]">
              <span className="font-semibold text-app-muted block">Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme === 'dark' ? '#86C175' : '#386641' }}></span>
                <span className="text-app-text">Platform Ingestion Hub</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme === 'dark' ? '#F0B865' : '#B7791F' }}></span>
                <span className="text-app-text">Trending Keyword / Topic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme === 'dark' ? '#B2BD9F' : '#5E6652' }}></span>
                <span className="text-app-text">Analytics Pipeline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
