'use client';

// Shared org-chart canvas for the two IT visualizer pages
// (role/it/hierarchy and role/it/payouts/visualize). Loads lazily,
// level by level, via getHierarchyChildrenAction — the root (Company)
// on mount, then one more level each time a node is expanded. This is
// what lets the same component handle 5k+ users: nothing is ever
// fetched or laid out beyond what's actually visible on screen.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Loader2, ChevronRight, Building2, Users as UsersIcon } from 'lucide-react';
import { getHierarchyChildrenAction, type HierarchyNode } from './actions';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 64;

interface OrgNodeData extends Record<string, unknown> {
  full_name: string;
  roleLabel: string;
  role: string;
  hasChildren: boolean;
  expanded: boolean;
  loading: boolean;
  highlighted: boolean;
  onExpand: (id: string) => void;
}

function OrgNode({ id, data }: NodeProps) {
  const d = data as OrgNodeData;
  const isSpecial = d.role === 'ceo' || d.role === 'governing_council' || d.role === 'unassigned';

  return (
    <div
      className={`rounded-xl border shadow-sm px-3 py-2 text-left transition-all ${
        d.highlighted
          ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
          : isSpecial
          ? 'bg-[#1e3a5f]/5 border-[#1e3a5f]/30'
          : 'bg-white border-[#e8ecf2]'
      }`}
      style={{ width: NODE_WIDTH }}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#c4a55a] !w-2 !h-2" />
      <div className="flex items-center gap-2 min-w-0">
        {d.role === 'ceo' ? <Building2 className="w-3.5 h-3.5 text-[#1e3a5f] shrink-0" /> : <UsersIcon className="w-3.5 h-3.5 text-[#5a6a82] shrink-0" />}
        <p className="text-sm font-semibold text-[#0f1d33] truncate">{d.full_name}</p>
      </div>
      <p className="text-[11px] text-[#5a6a82] mt-0.5">{d.roleLabel}</p>

      {d.hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            d.onExpand(id);
          }}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#1e3a5f] hover:underline disabled:opacity-50"
          disabled={d.loading}
        >
          {d.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronRight className={`w-3 h-3 transition-transform ${d.expanded ? 'rotate-90' : ''}`} />}
          {d.expanded ? 'Collapse' : 'Expand'}
        </button>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-[#c4a55a] !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { org: OrgNode };

function layout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 90 });

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return { ...n, position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 } };
  });
}

interface HierarchyGraphProps {
  /** Ids that should render green — the payout visualizer's "who gets
   * paid" set. Omit for the plain hierarchy view. */
  highlightIds?: Set<string>;
  /** Nodes to open automatically on load, top-down, so a specific
   * person is on screen without any clicking. Comes from the server
   * (getPayoutLineageForRegistrationAction) as a structural path, so it
   * stays correct even where a rung of the chain earns nothing. */
  expandPath?: string[];
}

export default function HierarchyGraph({ highlightIds, expandPath }: HierarchyGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const childrenCache = useRef<Map<string, HierarchyNode[]>>(new Map());
  // The fetched tree lives in refs (below), which React can't see — so a
  // load that adds children mutates them without triggering any render.
  // This counter is the render trigger: every successful fetch bumps it,
  // and the rebuild effect depends on it. Without this, expanding a node
  // that was ALREADY in expandedIds (which is exactly what the payout
  // auto-expand walk does to the root) left the newly-loaded children
  // invisible — the node read "Collapse" with nothing beneath it.
  const [dataVersion, setDataVersion] = useState(0);

  const rebuild = useCallback(
    (rawById: Map<string, HierarchyNode>, parentOf: Map<string, string | null>, expanded: Set<string>) => {
      const visibleIds = new Set<string>();
      const roots = [...rawById.values()].filter((n) => parentOf.get(n.id) === null);
      const stack = [...roots.map((r) => r.id)];
      while (stack.length > 0) {
        const id = stack.pop()!;
        if (visibleIds.has(id)) continue;
        visibleIds.add(id);
        if (expanded.has(id)) {
          const kids = childrenCache.current.get(id) || [];
          kids.forEach((k) => stack.push(k.id));
        }
      }

      const nextNodes: Node[] = [...visibleIds].map((id) => {
        const raw = rawById.get(id)!;
        return {
          id,
          type: 'org',
          position: { x: 0, y: 0 },
          data: {
            full_name: raw.full_name,
            roleLabel: raw.roleLabel,
            role: raw.role,
            hasChildren: raw.hasChildren,
            expanded: expanded.has(id),
            loading: loadingId === id,
            highlighted: highlightIds?.has(id) || false,
            onExpand: toggleExpand,
          } as OrgNodeData,
        };
      });

      const nextEdges: Edge[] = [...visibleIds]
        .map((id) => {
          const parentId = parentOf.get(id);
          if (!parentId || !visibleIds.has(parentId)) return null;
          const highlightEdge = (highlightIds?.has(id) && highlightIds?.has(parentId)) || false;
          return {
            id: `${parentId}->${id}`,
            source: parentId,
            target: id,
            style: highlightEdge ? { stroke: '#10b981', strokeWidth: 2 } : { stroke: '#c9d2e0' },
          } as Edge;
        })
        .filter(Boolean) as Edge[];

      setNodes(layout(nextNodes, nextEdges));
      setEdges(nextEdges);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingId, highlightIds]
  );

  const rawById = useRef<Map<string, HierarchyNode>>(new Map());
  const parentOf = useRef<Map<string, string | null>>(new Map());

  const loadChildren = useCallback(async (parentId: string | null) => {
    const res = await getHierarchyChildrenAction(parentId);
    if (!res.success) {
      setError(res.error || 'Failed to load the hierarchy.');
      return [];
    }
    res.nodes.forEach((n) => {
      rawById.current.set(n.id, n);
      parentOf.current.set(n.id, parentId);
    });
    if (parentId) childrenCache.current.set(parentId, res.nodes);
    setDataVersion((v) => v + 1);
    return res.nodes;
  }, []);

  // Read through a ref rather than closing over expandedIds, so this
  // callback stays referentially stable. It's baked into every node's
  // data by rebuild(), which doesn't list it as a dependency — a
  // changing identity here would hand already-rendered nodes a stale
  // expandedIds and break collapse after the first expand.
  const expandedRef = useRef<Set<string>>(expandedIds);
  expandedRef.current = expandedIds;

  const toggleExpand = useCallback(
    async (id: string) => {
      if (expandedRef.current.has(id)) {
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return;
      }

      if (!childrenCache.current.has(id)) {
        setLoadingId(id);
        await loadChildren(id);
        setLoadingId(null);
      }
      setExpandedIds((prev) => new Set(prev).add(id));
    },
    [loadChildren]
  );

  useEffect(() => {
    (async () => {
      const roots = await loadChildren(null);
      // Company's own children are fetched here, BEFORE marking it
      // expanded — marking first would render it as "Collapse" with an
      // empty level below and no pending fetch, and the only button
      // available would collapse it rather than load anything.
      await Promise.all(roots.map((r) => loadChildren(r.id)));
      // Auto-expand Company on first load so the canvas isn't just one
      // lonely box — everything past that is the user's own click.
      setExpandedIds((prev) => {
        const next = new Set(prev);
        roots.forEach((r) => next.add(r.id));
        return next;
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opens the server-supplied path (Governing Council → Director → …
  // → the seller's parent) top-down, fetching each level then revealing
  // it, so the canvas grows as data arrives rather than sitting still
  // through several round trips and jumping at the end. Only this one
  // branch is ever fetched, so it stays cheap at 5k+ users.
  const expandPathKey = (expandPath || []).join(',');
  useEffect(() => {
    if (!expandPathKey) return;
    const path = expandPathKey.split(',');
    let cancelled = false;
    (async () => {
      for (const id of path) {
        if (cancelled) return;
        if (!childrenCache.current.has(id)) await loadChildren(id);
        if (cancelled) return;
        setExpandedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expandPathKey, loadChildren]);

  useEffect(() => {
    rebuild(rawById.current, parentOf.current, expandedIds);
    // dataVersion is what makes a fetch visible — see its declaration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedIds, loadingId, highlightIds, rebuild, dataVersion]);

  const nodeTypesMemo = useMemo(() => nodeTypes, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypesMemo} fitView minZoom={0.1} proOptions={{ hideAttribution: true }}>
        <Background color="#e8ecf2" gap={20} />
        <Controls />
        <MiniMap pannable zoomable nodeColor={(n) => ((n.data as OrgNodeData)?.highlighted ? '#10b981' : '#c9d2e0')} />
      </ReactFlow>
    </div>
  );
}
