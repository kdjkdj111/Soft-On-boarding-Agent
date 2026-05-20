import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { FunctionalNodeData } from '../../services/functionalViewApi';

const getMethodColor = (method?: string) => {
  switch (method?.toUpperCase()) {
    case 'GET': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'POST': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'PUT':
    case 'PATCH': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

export const RingNode = memo(({ data }: NodeProps<FunctionalNodeData>) => {
  const methodStyle = getMethodColor(data.apiMethod);

  return (
    <div className="w-[180px] h-[44px] relative bg-white rounded-full shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow transition-all flex items-center px-1 overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-1.5 h-3 rounded-full bg-slate-300 border-none -ml-1" />
      
      {data.apiMethod ? (
        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${methodStyle} ml-2 shrink-0`}>
          {data.apiMethod.toUpperCase()}
        </div>
      ) : (
        <div className="w-2 h-2 rounded-full bg-purple-400 ml-3 shrink-0" />
      )}
      
      <div className="font-mono text-xs font-medium text-slate-700 ml-2 truncate pr-2">
        {data.label}
      </div>

      {/* Ring 노드는 leaf 노드이므로 source 핸들이 보통 필요없지만, 혹시 모를 확장을 위해 숨겨둡니다. */}
      <Handle type="source" position={Position.Right} className="opacity-0 pointer-events-none" />
    </div>
  );
});

RingNode.displayName = 'RingNode';
