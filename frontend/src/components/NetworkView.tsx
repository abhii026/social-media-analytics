import React, { useState, useMemo } from 'react';
import { NetworkData, NetworkNode } from '../types';
import { Share2, Info } from 'lucide-react';

interface NetworkViewProps {
  data: NetworkData | null;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  // Compute 2D coordinates for nodes in SVG canvas (600x380)
  const layout = useMemo(() => {
    if (!data || data.nodes.length === 0) return { positionedNodes: [], edges: [] };

    const width = 600;
    const height = 380;
    const centerX = width / 2;
    const centerY = height / 2;

    const positionedNodes = data.nodes.map((node, i) => {
      // Hub nodes placed near center
      if (node.id === 'Telegram') {
        return { ...node, x: centerX - 55, y: centerY };
      }
      if (node.id === 'System' || node.id === 'Hub') {
        return { ...node, x: centerX + 55, y: centerY };
      }

      // Other nodes placed radially around center
      const nonHubIndex = i;
      const angle = (nonHubIndex / (data.nodes.length - 2)) * 2 * Math.PI;
      const radius = 125 + (i % 2 === 0 ? 25 : -20);
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });

    const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

    const validEdges = data.edges
      .map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (sourceNode && targetNode) {
          return {
            ...edge,
            x1: sourceNode.x,
            y1: sourceNode.y,
            x2: targetNode.x,
            y2: targetNode.y,
          };
        }
        return null;
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return { positionedNodes, edges: validEdges };
  }, [data]);

  if (!data) return null;

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'platform':
        return '#16a34a'; // emerald-600
      case 'system':
        return '#525252'; // neutral-600
      case 'keyword':
        return '#7c3aed'; // violet-600
      default:
        return '#a3a3a3'; // neutral-400
    }
  };

  return (
    <div className="bg-white dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm mb-6 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            NetworkX Co-Occurrence Topology
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Topic and entity connections based on post co-occurrences
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono">
            {data.node_count} nodes
          </span>
          <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono">
            {data.edge_count} edges
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Graph Canvas */}
        <div className="lg:col-span-3 bg-[#fafafa] dark:bg-[#17181a] border border-neutral-200 dark:border-neutral-800 rounded-lg p-2 relative overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 600 380" className="w-full h-80 select-none">
            {/* Edges */}
            {layout.edges.map((edge, idx) => (
              <line
                key={`edge-${idx}`}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="currentColor"
                className="text-neutral-300 dark:text-neutral-700"
                strokeWidth={Math.min(3, Math.max(1, edge.weight * 0.7))}
                strokeOpacity={0.7}
              />
            ))}

            {/* Nodes */}
            {layout.positionedNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const radius = Math.max(6, Math.min(16, (node.size || 15) * 0.65));

              return (
                <g
                  key={`node-${node.id}`}
                  className="cursor-pointer transition-transform duration-150 hover:scale-110"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={getNodeColor(node.type)}
                    stroke={isSelected ? '#000000' : '#ffffff'}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    fillOpacity={0.85}
                  />
                  <text
                    x={node.x}
                    y={node.y + radius + 10}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="9"
                    fontFamily="sans-serif"
                    className="text-neutral-700 dark:text-neutral-300 pointer-events-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Detail & Legend Panel */}
        <div className="bg-[#fafafa] dark:bg-[#17181a] border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-neutral-400" />
              Node Inspector
            </h4>

            {selectedNode ? (
              <div className="space-y-2 mt-2 p-3 bg-white dark:bg-[#141416] rounded border border-neutral-200 dark:border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-500">Label:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white ml-2">{selectedNode.label}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Type:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 ml-2 uppercase">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Centrality:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 ml-2">{selectedNode.centrality}</span>
                </div>
                <div>
                  <span className="text-neutral-500">Weight:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 ml-2">{selectedNode.size}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                Click any node in the topology canvas to inspect its centrality score.
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">Legend:</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-neutral-600 dark:text-neutral-400">Platform Ingestion</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
              <span className="text-neutral-600 dark:text-neutral-400">Keywords & Topics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-600"></span>
              <span className="text-neutral-600 dark:text-neutral-400">Core Analytics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
