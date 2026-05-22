import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Layers, ChevronRight, ChevronDown } from 'lucide-react';

export const DomainNode = memo(({ id, data, isConnectable }: NodeProps) => {
  const { label, isExpanded, hasChildren, onToggle } = data;

  return (
    <div className="relative min-w-[240px] bg-gray-900 text-white rounded-xl shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      
      {/* Target Handle (Left) - Root nodes usually don't have targets, but safe to keep */}
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="opacity-0" />
      
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-800 text-gray-300">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Domain</div>
            <div className="text-base font-bold">{label || data.name}</div>
          </div>
        </div>
        
        {hasChildren && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(id);
            }}
            className="p-1.5 hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-300" /> : <ChevronRight className="w-5 h-5 text-gray-300" />}
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-2 h-2 !bg-gray-500" />
    </div>
  );
});

DomainNode.displayName = 'DomainNode';
