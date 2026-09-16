import { useState, useMemo } from 'react';

// Hardcoded aesthetically balanced node positions in an 800x440 SVG coordinate space
const NODE_COORDINATES = {
  1: { x: 380, y: 130 }, // Dr. Vikram Rao (Tech, center high)
  2: { x: 230, y: 170 }, // Priya Sundaram (Policy)
  3: { x: 290, y: 280 }, // GovInsight Dispatch (Policy)
  4: { x: 550, y: 150 }, // Ananya Sharma (Tech)
  5: { x: 650, y: 240 }, // RenewablePulse (Climate)
  6: { x: 180, y: 340 }, // FintechObserver (Finance)
  7: { x: 500, y: 260 }, // Arjun Mehta (Tech)
  8: { x: 360, y: 370 }, // National Wire (Policy)
  9: { x: 520, y: 370 }, // GreenFuture Forum (Climate)
  10: { x: 250, y: 400 }, // AngelCircle IN (Finance)
};

export default function NetworkGraph({
  nodes = [],
  edges = [],
  clusters = [],
  selectedNodeId,
  onSelectNode,
  compact = false,
}) {
  const [internalSelected, setInternalSelected] = useState(1);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const activeNodeId = selectedNodeId !== undefined ? selectedNodeId : internalSelected;
  const handleSelect = (id) => {
    if (onSelectNode) onSelectNode(id);
    setInternalSelected(id);
  };

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === activeNodeId) || nodes[0];
  }, [nodes, activeNodeId]);

  const clusterColorMap = useMemo(() => {
    const map = {};
    clusters.forEach((c) => {
      c.nodeIds?.forEach((nid) => {
        map[nid] = c.color;
      });
    });
    return map;
  }, [clusters]);

  return (
    <div className="flex flex-col w-full">
      {/* SVG Canvas Container */}
      <div className="relative w-full rounded-xl bg-dark-900/90 border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.25) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg
          viewBox="0 0 800 440"
          className="w-full h-auto max-h-[460px] select-none"
          style={{ minHeight: compact ? '260px' : '380px' }}
        >
          {/* Edge lines */}
          {edges.map((edge, idx) => {
            const src = NODE_COORDINATES[edge.source];
            const tgt = NODE_COORDINATES[edge.target];
            if (!src || !tgt) return null;

            const isConnected =
              hoveredNodeId === edge.source ||
              hoveredNodeId === edge.target ||
              activeNodeId === edge.source ||
              activeNodeId === edge.target;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isConnected ? '#22d3ee' : 'rgba(148, 163, 184, 0.2)'}
                  strokeWidth={isConnected ? 2.5 : 1.2}
                  strokeDasharray={isConnected ? 'none' : '4 3'}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Node circles */}
          {nodes.map((node) => {
            const coords = NODE_COORDINATES[node.id] || { x: 400, y: 220 };
            const nodeColor = clusterColorMap[node.id] || '#8b5cf6';
            const isSelected = activeNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const radius = 18 + (node.influence / 100) * 8;

            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${coords.x}, ${coords.y})`}
                onClick={() => handleSelect(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer group"
              >
                {/* Glow ring on hover/select */}
                {(isSelected || isHovered) && (
                  <circle
                    r={radius + 8}
                    fill={nodeColor}
                    opacity={0.25}
                    className="animate-ping"
                  />
                )}

                {/* Selection border ring */}
                {isSelected && (
                  <circle
                    r={radius + 5}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth={2}
                    strokeDasharray="3 2"
                  />
                )}

                {/* Base Node */}
                <circle
                  r={radius}
                  fill="#11131c"
                  stroke={nodeColor}
                  strokeWidth={isSelected || isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />

                {/* Avatar emoji */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={radius * 0.85}
                  pointerEvents="none"
                >
                  {node.avatar}
                </text>

                {/* Node Name */}
                <text
                  y={radius + 14}
                  textAnchor="middle"
                  fill={isSelected || isHovered ? '#ffffff' : '#94a3b8'}
                  fontSize={10}
                  fontWeight={isSelected ? '600' : '400'}
                  pointerEvents="none"
                  className="transition-colors duration-150"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Cluster Legend Bar */}
      {clusters && clusters.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-800/60">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cluster.color }}
              />
              <span className="font-medium text-slate-300">{cluster.name}</span>
              <span className="text-slate-500">({(cluster.members / 1000).toFixed(0)}K)</span>
            </div>
          ))}
        </div>
      )}

      {/* Node detail inspector */}
      {!compact && selectedNode && (
        <div className="mt-4 p-4 rounded-xl bg-dark-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
              {selectedNode.avatar}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">{selectedNode.name}</h4>
                <span className="text-xs text-brand-400 font-mono">{selectedNode.handle}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cluster: <span className="text-slate-300 font-medium">{selectedNode.category}</span> • Platform: <span className="uppercase text-slate-300">{selectedNode.platform}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
            <div className="text-center sm:text-right">
              <div className="text-base font-bold text-cyan-400 font-display">
                {selectedNode.influence}/100
              </div>
              <div className="text-[10px] uppercase text-slate-500 font-medium">Influence Score</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-base font-bold text-white font-display">
                {selectedNode.followers}
              </div>
              <div className="text-[10px] uppercase text-slate-500 font-medium">Followers</div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-base font-bold text-slate-300 font-display">
                {selectedNode.connections}
              </div>
              <div className="text-[10px] uppercase text-slate-500 font-medium">Connected Links</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
