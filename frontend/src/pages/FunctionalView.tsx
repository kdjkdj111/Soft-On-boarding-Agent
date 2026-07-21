import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Hand, MousePointer2 } from 'lucide-react';

import { DomainNode } from '../components/diagram/DomainNode';
import { ServiceNode } from '../components/diagram/ServiceNode';
import { MethodNode } from '../components/diagram/MethodNode';
import { ContextDrawer } from '../components/common/ContextDrawer';
import { spaceApi } from '../services/spaceApi';
import { functionalViewApi, type CommitSummary } from '../services/functionalViewApi';
import { useAuthStore } from '../store/authStore';

const nodeTypes = {
  domainNode: DomainNode,
  serviceNode: ServiceNode,
  methodNode: MethodNode,
};

// ─────────────────────────────────────────────────────────────────────────────
// 레이아웃 유틸리티 함수들 (스파게티 코드 방지 및 가독성 확보)
// ─────────────────────────────────────────────────────────────────────────────

/** 1. 그래프 탐색을 통해 연결된 노드 그룹(서브그래프)들을 찾습니다. */
function findConnectedComponents(nodes: Node[], edges: Edge[]): Node[][] {
  const adj = new Map<string, Set<string>>();
  nodes.forEach(n => adj.set(n.id, new Set()));
  edges.forEach(e => {
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source)!.add(e.target);
      adj.get(e.target)!.add(e.source);
    }
  });

  const visited = new Set<string>();
  const components: Node[][] = [];

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const compNodes: Node[] = [];
      const queue = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const current = queue.shift()!;
        const currNode = nodes.find(n => n.id === current);
        if (currNode) compNodes.push(currNode);

        adj.get(current)?.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }
      components.push(compNodes);
    }
  });
  return components;
}

/** 2. 단일 그룹에 대해 Dagre 레이아웃을 적용하고 바운딩 박스를 계산합니다. */
function applyDagreToComponent(compNodes: Node[], edges: Edge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 160 });

  compNodes.forEach(node => {
    let width = 240, height = 80;
    if (node.type === 'domainNode') { width = 240; height = 90; }
    if (node.type === 'serviceNode') { width = 220; height = 80; }
    if (node.type === 'methodNode') { width = 180; height = 60; }
    dagreGraph.setNode(node.id, { width, height });
  });

  const compNodeIds = new Set(compNodes.map(n => n.id));
  edges.forEach(edge => {
    if (compNodeIds.has(edge.source) && compNodeIds.has(edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  compNodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    let width = 240, height = 80;
    if (node.type === 'domainNode') { width = 240; height = 90; }
    if (node.type === 'serviceNode') { width = 220; height = 80; }
    if (node.type === 'methodNode') { width = 180; height = 60; }

    const x = nodeWithPosition.x - width / 2;
    const y = nodeWithPosition.y - height / 2;
    node.position = { x, y };

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return { nodes: compNodes, width: maxX - minX, height: maxY - minY, minX, minY };
}

/** 3. 전체 레이아웃 계산 메인 함수 */
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  if (nodes.length === 0) return { nodes, edges };

  // 1단계: 연결된 트리 단위로 분리
  const components = findConnectedComponents(nodes, edges);

  // 2단계: 각 트리 단위별로 내부 레이아웃(Dagre) 계산
  const componentBoxes = components.map(comp => applyDagreToComponent(comp, edges));

  // 3단계: 전체 트리를 그리드나 유저 수동 위치를 기반으로 캔버스에 최종 배치
  const GRID_SPACING_X = 150;
  const GRID_SPACING_Y = 100;
  const MAX_ROW_WIDTH = 1200;

  let currentX = 0;
  let currentY = 0;
  let rowMaxHeight = 0;

  componentBoxes.forEach(box => {
    // 신규 노드면 그리드 형태(Word Wrap)로 빈 공간에 자동 배치
    if (currentX + box.width > MAX_ROW_WIDTH && currentX > 0) {
      currentX = 0;
      currentY += rowMaxHeight + GRID_SPACING_Y;
      rowMaxHeight = 0;
    }

    const offsetX = currentX - box.minX;
    const offsetY = currentY - box.minY;

    box.nodes.forEach(node => {
      node.position.x += offsetX;
      node.position.y += offsetY;
    });

    currentX += box.width + GRID_SPACING_X;
    rowMaxHeight = Math.max(rowMaxHeight, box.height);
  });

  return { nodes, edges };
};

function FunctionalViewContent() {
  const spaceId = useAuthStore((state) => state.user?.spaceId);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Raw data from API
  const [rawNodes, setRawNodes] = useState<any[]>([]);
  const [rawEdges, setRawEdges] = useState<any[]>([]);

  // Progressive Disclosure State
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false); // 마우스 선택 모드 상태 추가
  // 노드 클릭 시 조회한 실제 커밋 히스토리
  const [nodeCommits, setNodeCommits] = useState<CommitSummary[]>([]);
  const [isCommitsLoading, setIsCommitsLoading] = useState(false);

  const { fitView } = useReactFlow();

  // API Fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!spaceId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await spaceApi.getFunctionalView(spaceId);
        setRawNodes(data.nodes);
        setRawEdges(data.edges);
        setError(null);
      } catch (err: any) {
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [spaceId]);

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const onNodeClick = useCallback(async (_event: React.MouseEvent, node: Node) => {
    if (node.type === 'serviceNode' || node.type === 'methodNode') {
      // 1. Drawer를 즉시 열어 빠른 반응성 확보
      setSelectedNode(node);
      setIsDrawerOpen(true);
      setNodeCommits([]);

      // 2. 커밋 히스토리는 비동기로 불러와 Drawer 안에서 스피너 → 리스트로 교체
      if (!spaceId) return;
      setIsCommitsLoading(true);
      try {
        const raw = await functionalViewApi.getCommitsForElement(
          spaceId,
          Number(node.id)
        );
        // SHA 기준 중복 제거 (GitHub API가 동일 커밋을 중복 반환하는 경우 방어)
        const seen = new Set<string>();
        const deduped = raw.filter(c => {
          if (seen.has(c.sha)) return false;
          seen.add(c.sha);
          return true;
        });
        setNodeCommits(deduped);
      } catch {
        setNodeCommits([]);
      } finally {
        setIsCommitsLoading(false);
      }
    }
  }, [spaceId]);

  // Compute Layout when data or expanded state changes
  useEffect(() => {
    if (rawNodes.length === 0) return;

    // 1. Calculate Visibility
    const visibleNodeIds = new Set<string>();
    const queue: string[] = [];

    rawNodes.forEach(n => {
      if (!n.parentId) {
        visibleNodeIds.add(n.id);
        if (expandedNodeIds.has(n.id)) {
          queue.push(n.id);
        }
      }
    });

    while (queue.length > 0) {
      const parentId = queue.shift()!;
      rawNodes.forEach(n => {
        if (n.parentId === parentId) {
          visibleNodeIds.add(n.id);
          if (expandedNodeIds.has(n.id)) {
            queue.push(n.id);
          }
        }
      });
    }

    // 2. Map to React Flow Nodes
    const mappedNodes: Node[] = rawNodes
      .filter(n => visibleNodeIds.has(n.id))
      .map(node => {
        let frontendType = node.type;
        if (node.type === 'forestNode') frontendType = 'domainNode';
        if (node.type === 'treeNode') frontendType = 'serviceNode';
        if (node.type === 'ringNode') frontendType = 'methodNode';

        const hasChildren = rawNodes.some(n => n.parentId === node.id);

        return {
          id: node.id,
          type: frontendType,
          position: { x: 0, y: 0 },
          data: {
            ...node.data,
            isExpanded: expandedNodeIds.has(node.id),
            hasChildren,
            onToggle: toggleExpand,
            layer: node.type === 'treeNode' ? 'Service' : 'Controller',
          }
        };
      });

    // 3. Filter Edges
    const mappedEdges: Edge[] = rawEdges
      .filter(e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .map(e => ({
        ...e,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#cbd5e1', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed' as any, color: '#cbd5e1' },
      }));

    // 4. Run Dagre Layout without state persistence (to avoid overlapping chaos)
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(mappedNodes, mappedEdges);

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // 부드러운 포커스 애니메이션 (약간의 지연 후 실행하여 DOM 반영 대기)
    setTimeout(() => {
      fitView({ duration: 800, padding: 0.3 });
    }, 50);
  }, [rawNodes, rawEdges, expandedNodeIds, setNodes, setEdges, toggleExpand, fitView]);

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center bg-gray-50/30">
      <div className="text-gray-500 animate-pulse font-medium tracking-wide">AI 분석 결과를 불러오는 중입니다...</div>
    </div>;
  }

  if (error) {
    return <div className="w-full h-full flex items-center justify-center bg-gray-50/30">
      <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</div>
    </div>;
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={1.5}
        panOnDrag={!isSelectMode} // 모드에 따라 팬/선택 토글
        selectionOnDrag={isSelectMode}
        selectionMode={isSelectMode ? SelectionMode.Partial : SelectionMode.Full}
        className="bg-gray-50/30"
      >
        <Background color="#cbd5e1" gap={20} size={1.5} />
        <Controls className="bg-white/80 backdrop-blur-md shadow-sm border border-gray-200 rounded-lg overflow-hidden" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'domainNode') return '#111827';
            if (node.type === 'serviceNode') return '#8b5cf6'; // violet-500
            if (node.type === 'methodNode') return '#3b82f6'; // blue-500
            return '#cbd5e1';
          }}
          maskColor="rgba(248, 250, 252, 0.6)"
          className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200 !rounded-2xl overflow-hidden !m-4"
        />

        {/* 툴바: 화면 이동 vs 다중 선택 토글 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-gray-200 gap-1">
          <button
            onClick={() => setIsSelectMode(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold ${
              !isSelectMode ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <Hand className="w-4 h-4" /> 화면 이동
          </button>
          <button
            onClick={() => setIsSelectMode(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold ${
              isSelectMode ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <MousePointer2 className="w-4 h-4" /> 영역 선택
          </button>
        </div>
      </ReactFlow>

      <ContextDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedNode={selectedNode}
        commits={nodeCommits}
        isCommitsLoading={isCommitsLoading}
      />
    </div>
  );
}

export function FunctionalView() {
  return (
    <ReactFlowProvider>
      <FunctionalViewContent />
    </ReactFlowProvider>
  );
}
