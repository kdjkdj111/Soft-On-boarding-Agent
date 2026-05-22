import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Play } from 'lucide-react';

export const MethodNode = memo(({ data, isConnectable }: NodeProps) => {
  const { name, apiMethod } = data;

  return (
    <div className="relative min-w-[180px] bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className="w-2 h-2 !bg-gray-400" />
      
      <div className="py-2 px-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Play className="w-3 h-3 text-blue-600 ml-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Method</div>
          <div className="text-xs font-semibold text-gray-700 truncate">{name || data.label}</div>
        </div>
        {apiMethod && (
          <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
            apiMethod === 'GET' ? 'bg-green-100 text-green-700' :
            apiMethod === 'POST' ? 'bg-blue-100 text-blue-700' :
            apiMethod === 'PUT' ? 'bg-orange-100 text-orange-700' :
            apiMethod === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
          }`}>
            {apiMethod}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className="w-2 h-2 !bg-gray-400" />
    </div>
  );
});

MethodNode.displayName = 'MethodNode';
