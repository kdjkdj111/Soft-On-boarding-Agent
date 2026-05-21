import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';

/** 노드 타입별 기본 크기 */
const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  forestNode: { width: 260, height: 90 },
  treeNode:   { width: 220, height: 70 },
  ringNode:   { width: 180, height: 44 },
};

/**
 * dagre를 사용해 ReactFlow 노드/엣지에 LR(왼쪽→오른쪽) 레이아웃을 계산합니다.
 * hidden 노드는 레이아웃 계산에서 제외됩니다.
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80 });

  const visibleNodes = nodes.filter((n) => !n.hidden);
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  visibleNodes.forEach((node) => {
    const { width, height } = NODE_DIMENSIONS[node.type ?? 'treeNode'] ?? { width: 200, height: 60 };
    dagreGraph.setNode(node.id, { width, height });
  });

  visibleEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    if (node.hidden) return node;
    const { x, y, width, height } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: x - width / 2, y: y - height / 2 },
    };
  });

  return { nodes: layoutedNodes, edges };
}
