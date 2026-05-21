import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Layers, ChevronRight, ChevronDown } from 'lucide-react';
import type { FunctionalNodeData } from '../../services/functionalViewApi';

type ForestNodeProps = NodeProps<FunctionalNodeData & { isExpanded?: boolean; onToggle?: (id: string) => void }>;

export const ForestNode = memo(({ id, data }: ForestNodeProps) => {
  const isExpanded = data.isExpanded ?? false;

  return (
    <div
      className={`
        w-[260px] relative rounded-2xl bg-white shadow-md border-2 transition-all duration-300
        ${isExpanded ? 'border-blue-500 shadow-blue-100' : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'}
      `}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-4 rounded-sm bg-slate-300 border-none" />
      
      {/* 윗부분 그라디언트 헤더 */}
      <div className="h-12 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl flex items-center px-4 border-b border-slate-100">
        <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
          <Layers className="w-4 h-4 text-blue-600" />
        </div>
        <div className="font-bold text-slate-800 text-sm truncate flex-1">{data.label}</div>
      </div>

      {/* 아랫부분 설명 & 토글 버튼 */}
      <div className="px-4 py-3 bg-white rounded-b-xl flex justify-between items-center">
        <div className="text-xs text-slate-500 line-clamp-1 flex-1 mr-2">
          {data.description || '도메인 영역'}
        </div>
        
        {/* 토글 버튼 (클릭 이벤트를 막지 않아야 함) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (data.onToggle) data.onToggle(id);
          }}
          className="w-6 h-6 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors border border-slate-200"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-4 rounded-sm bg-blue-400 border-none" />
    </div>
  );
});

ForestNode.displayName = 'ForestNode';
