import type { Node, Edge } from 'reactflow';

export const initialNodes: Node[] = [
  {
    id: 'group-auth',
    type: 'featureGroup',
    position: { x: 50, y: 50 },
    style: { width: 900, height: 400 },
    data: { label: '회원 가입 및 인증 (Auth Feature)' },
  },
  {
    id: 'node-1',
    type: 'classNode',
    parentId: 'group-auth',
    position: { x: 50, y: 150 },
    data: { name: 'AuthController', layer: 'Controller', isLastWorked: false },
  },
  {
    id: 'node-2',
    type: 'classNode',
    parentId: 'group-auth',
    position: { x: 350, y: 150 },
    data: { name: 'AuthService', layer: 'Service', isLastWorked: true },
  },
  {
    id: 'node-3',
    type: 'classNode',
    parentId: 'group-auth',
    position: { x: 650, y: 50 },
    data: { name: 'OAuthClient', layer: 'External', isLastWorked: false },
  },
  {
    id: 'node-4',
    type: 'classNode',
    parentId: 'group-auth',
    position: { x: 650, y: 250 },
    data: { name: 'UserRepository', layer: 'Repository', isLastWorked: false },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'node-1',
    target: 'node-2',
    animated: true,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed' as any, color: '#94a3b8' },
  },
  {
    id: 'e2-3',
    source: 'node-2',
    target: 'node-3',
    animated: true,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed' as any, color: '#94a3b8' },
  },
  {
    id: 'e2-4',
    source: 'node-2',
    target: 'node-4',
    animated: true,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed' as any, color: '#94a3b8' },
  },
];
