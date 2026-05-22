import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Server, Code2, Database, Cloud, ChevronRight, ChevronDown } from 'lucide-react';

const layerConfig: Record<string, { color: string; icon: any; bg: string }> = {
  Controller: { color: 'border-blue-500', icon: Code2, bg: 'bg-blue-50 text-blue-600' },
  Service: { color: 'border-purple-500', icon: Server, bg: 'bg-purple-50 text-purple-600' },
  Repository: { color: 'border-green-500', icon: Database, bg: 'bg-green-50 text-green-600' },
  External: { color: 'border-orange-500', icon: Cloud, bg: 'bg-orange-50 text-orange-600' },
};

export const ServiceNode = memo(({ id, data, isConnectable }: NodeProps) => {
  const { layer = 'Service', name, isExpanded, hasChildren, onToggle } = data;
  const config = layerConfig[layer] || layerConfig.Service;
  const Icon = config.icon;

  return (
    <div className={`
      relative min-w-[220px] bg-white rounded-lg shadow-sm border border-gray-200 
      border-l-4 ${config.color} 
      transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
    `}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-2 h-2 !bg-gray-400" />
      
      <div className="p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${config.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{layer}</div>
            <div className="text-sm font-bold text-gray-800">{name || data.label}</div>
          </div>
        </div>

        {hasChildren && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggle(id);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-2 h-2 !bg-gray-400" />
    </div>
  );
});

ServiceNode.displayName = 'ServiceNode';
