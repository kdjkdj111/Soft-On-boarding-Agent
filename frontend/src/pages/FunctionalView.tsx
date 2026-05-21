import { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import type { Node } from 'reactflow';
import 'reactflow/dist/style.css';

import { FeatureGroupNode } from '../components/diagram/FeatureGroupNode';
import { ClassNode } from '../components/diagram/ClassNode';
import { ContextDrawer } from '../components/common/ContextDrawer';
import { initialNodes, initialEdges } from './FunctionalViewData';

const nodeTypes = {
  featureGroup: FeatureGroupNode,
  classNode: ClassNode,
};

export function FunctionalView() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.type === 'classNode') {
      setSelectedNode(node);
      setIsDrawerOpen(true);
    }
  }, []);

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
        className="bg-gray-50/30"
      >
        <Background color="#9ca3af" gap={24} size={1} />
        <Controls className="bg-white shadow-sm border border-gray-200" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'featureGroup') return '#f8fafc';
            if (node.data?.layer === 'Service') return '#c084fc'; // purple-400
            if (node.data?.layer === 'Controller') return '#60a5fa'; // blue-400
            return '#94a3b8';
          }}
          maskColor="rgba(248, 250, 252, 0.7)"
          className="bg-white shadow-sm border border-gray-200"
        />
      </ReactFlow>

      <ContextDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        selectedNode={selectedNode}
      />
    </div>
  );
}

