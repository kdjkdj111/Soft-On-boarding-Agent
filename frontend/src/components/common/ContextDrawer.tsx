import { X, Bot, Clock } from 'lucide-react';
import type { Node } from 'reactflow';

interface ContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: Node | null;
}

export function ContextDrawer({ isOpen, onClose, selectedNode }: ContextDrawerProps) {
  if (!selectedNode || !selectedNode.data) return null;

  const { name, layer, isLastWorked } = selectedNode.data;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                {layer}
              </span>
              {isLastWorked && (
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  Last Worked
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* LLM Summary */}
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50">
            <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
              <Bot className="w-5 h-5" />
              <h3>AI Code Summary</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {layer === 'Service' 
                ? '소셜 로그인 요청을 받아 카카오/구글 API와 통신하고 결과를 DB에 저장하는 비즈니스 로직을 담당합니다. 트랜잭션 관리 및 예외 처리가 포함되어 있습니다.'
                : '해당 클래스의 주요 기능 및 역할에 대한 AI 요약 정보가 이곳에 표시됩니다.'}
            </p>
          </div>

          {/* Commit History */}
          <div>
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3>Recent History</h3>
            </div>
            
            <div className="space-y-4">
              {/* Mock Commit 1 */}
              <div className="relative pl-4 border-l-2 border-gray-200">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-gray-300 border-2 border-white" />
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">feat: 구글 OAuth 연동 추가</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">전</div>
                  <span>전임자 (prev-dev)</span>
                </div>
              </div>

              {/* Mock Commit 2 */}
              <div className="relative pl-4 border-l-2 border-gray-200">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-gray-300 border-2 border-white" />
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">fix: 카카오 토큰 파싱 에러 수정</span>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">전</div>
                  <span>전임자 (prev-dev)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
