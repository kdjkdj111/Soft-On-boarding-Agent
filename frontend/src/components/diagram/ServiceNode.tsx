import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Server, Code2, Database, Cloud, ChevronRight, ChevronDown } from 'lucide-react';

const layerConfig: Record<string, { color: string; icon: any; bg: string }> = {
  Controller: { color: 'border-blue-200 bg-blue-50/50 hover:ring-blue-100', icon: Code2, bg: 'bg-blue-100 text-blue-600 shadow-sm border border-blue-200/50' },
  Service: { color: 'border-purple-200 bg-purple-50/50 hover:ring-purple-100', icon: Server, bg: 'bg-purple-100 text-purple-600 shadow-sm border border-purple-200/50' },
  Repository: { color: 'border-green-200 bg-green-50/50 hover:ring-green-100', icon: Database, bg: 'bg-green-100 text-green-600 shadow-sm border border-green-200/50' },
  External: { color: 'border-orange-200 bg-orange-50/50 hover:ring-orange-100', icon: Cloud, bg: 'bg-orange-100 text-orange-600 shadow-sm border border-orange-200/50' },
};

export const ServiceNode = memo(({ id, data, isConnectable }: NodeProps) => {
  const { layer = 'Service', name, isExpanded, hasChildren, onToggle } = data;
  const config = layerConfig[layer] || layerConfig.Service;
  const Icon = config.icon;

  return (
    <div className={`
      relative min-w-[220px] rounded-[1.25rem] shadow-sm border backdrop-blur-sm
      ${config.color} 
      transition-all duration-300 hover:shadow-lg hover:ring-4 hover:-translate-y-1
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
