import { X, Layers, Settings, FileCode2, Globe } from 'lucide-react';
import type { Node } from 'reactflow';
import type { FunctionalNodeData } from '../../services/functionalViewApi';

interface ContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: Node<FunctionalNodeData> | null;
}

export function ContextDrawer({ isOpen, onClose, selectedNode }: ContextDrawerProps) {
  if (!selectedNode || !selectedNode.data) return null;

  const { type, data } = selectedNode;
  const { label, description, filePath, apiMethod, apiUrl } = data;

  const getLayerName = () => {
    switch (type) {
      case 'forestNode': return 'DOMAIN (FOREST)';
      case 'treeNode': return 'CLASS/MODULE (TREE)';
      case 'ringNode': return 'ENDPOINT/METHOD (RING)';
      default: return 'NODE';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col border-l border-slate-200
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                {getLayerName()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 break-all">{label}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors self-start"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* AI Description (FOREST/TREE) */}
          {description && (
            <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50">
              <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
                {type === 'forestNode' ? <Layers className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                <h3 className="text-sm">AI 요약 정보</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          {/* File Path */}
          {filePath && (
            <div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                <FileCode2 className="w-4 h-4" />
                <h3 className="text-sm">소스 파일</h3>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto">
                <code className="text-xs text-slate-600 font-mono break-all">
                  {filePath}
                </code>
              </div>
            </div>
          )}

          {/* API Info (RING) */}
          {(apiMethod || apiUrl) && (
            <div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                <Globe className="w-4 h-4" />
                <h3 className="text-sm">API 엔드포인트</h3>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 font-mono text-sm shadow-inner flex flex-col gap-2">
                {apiMethod && (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-12">Method</span>
                    <span className="text-emerald-400 font-bold">{apiMethod.toUpperCase()}</span>
                  </div>
                )}
                {apiUrl && (
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs w-12">URL</span>
                    <span className="text-blue-300 break-all">{apiUrl}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
