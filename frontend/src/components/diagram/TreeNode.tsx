import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Settings, ChevronRight, ChevronDown } from 'lucide-react';
import type { FunctionalNodeData } from '../../services/functionalViewApi';

type TreeNodeProps = NodeProps<FunctionalNodeData & { isExpanded?: boolean; onToggle?: (id: string) => void }>;

export const TreeNode = memo(({ id, data }: TreeNodeProps) => {
  const isExpanded = data.isExpanded ?? false;

  return (
    <div
      className={`
        w-[220px] relative rounded-xl bg-white shadow-sm border transition-all duration-300
        ${isExpanded ? 'border-teal-500 ring-1 ring-teal-500/20' : 'border-slate-200 hover:border-slate-300'}
      `}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-4 rounded-sm bg-slate-300 border-none" />
      
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 max-w-[85%]">
            <Settings className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="font-semibold text-slate-700 text-sm truncate">{data.label}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (data.onToggle) data.onToggle(id);
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
        
        {data.filePath && (
          <div className="text-[10px] text-slate-400 font-mono truncate px-5">
            {data.filePath.split('/').pop()}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-4 rounded-sm bg-teal-400 border-none" />
    </div>
  );
});

TreeNode.displayName = 'TreeNode';
