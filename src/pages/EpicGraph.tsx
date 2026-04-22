import { useState, useEffect, useCallback, KeyboardEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnConnect,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuth } from '../contexts/AuthContext';
import EpicGraphNodeComponent from '../components/board/epic-graph-node';
import EpicDetailPanel from '../components/board/epic-detail-panel';
import CustomFilter, { type FilterOption } from '../components/ui/CustomFilter';
import type { EpicGraphData, EpicGraphNode, WorkItem } from '../types';

const NODE_TYPES = { epicNode: EpicGraphNodeComponent };
const TEAM_ORDER = ['Tech', 'Marketing', 'Media', 'Sale', 'Cross-team', 'Unassigned'];
const COL_WIDTH = 280;
const ROW_HEIGHT = 170;

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}

function buildNodes(
  epics: EpicGraphNode[],
  teamFilter: string,
  statusFilter: string,
  linkingFromId: string | null
): Node[] {
  const filtered = epics.filter(
    e =>
      (teamFilter === 'All' || e.primaryTeam === teamFilter) &&
      (statusFilter === 'All' || e.status === statusFilter)
  );
  const byTeam = groupBy(filtered, e => e.primaryTeam);
  const nodes: Node[] = [];
  TEAM_ORDER.forEach((team, colIdx) => {
    (byTeam[team] ?? []).forEach((epic, rowIdx) => {
      nodes.push({
        id: epic.id,
        type: 'epicNode',
        position: { x: colIdx * COL_WIDTH + 40, y: rowIdx * ROW_HEIGHT + 40 },
        data: { ...epic, isLinking: epic.id === linkingFromId },
      });
    });
  });
  return nodes;
}

function buildEdges(links: EpicGraphData['links']): Edge[] {
  return links.map(l => ({
    id: l.id,
    source: l.fromId,
    target: l.toId,
    label: 'related',
    style: { strokeDasharray: '5,4', stroke: '#94a3b8' },
    labelStyle: { fontSize: 10, fill: '#94a3b8' },
    animated: false,
  }));
}

export default function EpicGraph({ hideHeader = false }: { hideHeader?: boolean }) {
  const { users } = useAuth();
  const [graphData, setGraphData] = useState<EpicGraphData>({ epics: [], links: [] });
  const [allWorkItems, setAllWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const [selectedEpic, setSelectedEpic] = useState<WorkItem | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const fetchGraph = useCallback(async () => {
    try {
      const [graphRes, itemsRes] = await Promise.all([
        fetch('/api/work-items/epics/graph'),
        fetch('/api/work-items'),
      ]);
      if (graphRes.ok) setGraphData(await graphRes.json());
      if (itemsRes.ok) setAllWorkItems(await itemsRes.json());
    } catch (e) {
      console.error('Failed to fetch epic graph', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  // Rebuild nodes/edges whenever data or filters change
  useEffect(() => {
    setNodes(buildNodes(graphData.epics, teamFilter, statusFilter, linkingFrom));
    setEdges(buildEdges(graphData.links));
  }, [graphData, teamFilter, statusFilter, linkingFrom, setNodes, setEdges]);

  // Escape cancels linking mode
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setLinkingFrom(null);
  }, []);

  const handleNodeClick: NodeMouseHandler = useCallback(
    async (_evt, node) => {
      if (linkingFrom) {
        if (linkingFrom === node.id) { setLinkingFrom(null); return; }
        try {
          await fetch('/api/work-items/dependencies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromId: linkingFrom, toId: node.id }),
          });
          await fetchGraph();
        } catch (e) {
          console.error(e);
        }
        setLinkingFrom(null);
        return;
      }
      // Open detail panel
      const epic = allWorkItems.find(w => w.id === node.id);
      if (epic) setSelectedEpic(epic);
    },
    [linkingFrom, allWorkItems, fetchGraph]
  );

  const handleNodeCtrlClick: NodeMouseHandler = useCallback((_evt, node) => {
    setLinkingFrom(prev => (prev === node.id ? null : node.id));
  }, []);

  // Drag-to-connect via ReactFlow handles
  const handleConnect: OnConnect = useCallback(
    async params => {
      if (!params.source || !params.target) return;
      try {
        await fetch('/api/work-items/dependencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromId: params.source, toId: params.target }),
        });
        await fetchGraph();
      } catch (e) {
        console.error(e);
      }
    },
    [fetchGraph]
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    async (_evt, edge) => {
      if (!confirm('Xóa liên kết này?')) return;
      try {
        await fetch(`/api/work-items/dependencies/${edge.id}`, { method: 'DELETE' });
        await fetchGraph();
      } catch (e) {
        console.error(e);
      }
    },
    [fetchGraph]
  );

  const toOpts = (arr: string[]): FilterOption[] => arr.map(v => ({ value: v, label: v }));
  const teamOptions = toOpts(['All', ...TEAM_ORDER]);
  const statusOptions = toOpts(['All', 'Backlog', 'Todo', 'Active', 'Review', 'Done', 'Void']);

  const userList = (users ?? []).map(u => ({ id: u.id, fullName: u.fullName }));

  return (
    <div
      className="flex flex-col h-full outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-base font-semibold text-slate-800">Epic Graph</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {graphData.epics.length} epics · {graphData.links.length} links
              {linkingFrom && (
                <span className="ml-2 text-orange-500 font-medium">
                  · Ctrl+Click node để link · Esc để hủy
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CustomFilter
              value={teamFilter}
              onChange={setTeamFilter}
              options={teamOptions}
            />
            <CustomFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
            />
          </div>
        </div>
      )}

      {/* Graph canvas */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            Đang tải…
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onNodeClick={(evt, node) => {
              if (evt.ctrlKey || evt.metaKey) handleNodeCtrlClick(evt, node);
              else handleNodeClick(evt, node);
            }}
            onEdgeClick={handleEdgeClick}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.3}
          >
            <Background gap={20} size={1} color="#f1f5f9" />
            <Controls />
            <MiniMap nodeStrokeWidth={2} zoomable pannable />
          </ReactFlow>
        )}
      </div>

      {/* Detail panel */}
      {selectedEpic && (
        <EpicDetailPanel
          epic={selectedEpic}
          allItems={allWorkItems}
          users={userList}
          isOpen={!!selectedEpic}
          onClose={() => setSelectedEpic(null)}
          onUpdate={fetchGraph}
        />
      )}
    </div>
  );
}
