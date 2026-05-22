import { X, Bot, Clock, GitCommit, ExternalLink } from 'lucide-react';
import type { Node } from 'reactflow';
import type { CommitSummary } from '../../services/functionalViewApi';

interface ContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: Node | null;
  /** 노드가 클릭된 파일의 실제 커밋 히스토리 (백엔드 GitHub API 필터링 결과) */
  commits: CommitSummary[];
  /** 커밋 로딩 중 여부 (Drawer 열릴 때 비동기 로드) */
  isCommitsLoading: boolean;
}

/** ISO 8601 날짜 문자열을 "YYYY.MM.DD" 형식으로 변환 */
function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');
  } catch {
    return isoDate.slice(0, 10);
  }
}

/** 작성자 이름의 첫 글자를 아바타로 표시 */
function AuthorAvatar({ name }: { name: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
      {initial}
    </div>
  );
}

export function ContextDrawer({
  isOpen,
  onClose,
  selectedNode,
  commits,
  isCommitsLoading,
}: ContextDrawerProps) {
  if (!selectedNode || !selectedNode.data) return null;

  const { label, description, layer, filePath, apiMethod, apiUrl } = selectedNode.data;

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
          fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                {layer ?? (selectedNode.type === 'serviceNode' ? 'Service' : 'Controller')}
              </span>
              {apiMethod && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {apiMethod}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{label}</h2>
            {apiUrl && (
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{apiUrl}</p>
            )}
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

          {/* AI Code Summary */}
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100/50">
            <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
              <Bot className="w-5 h-5" />
              <h3>AI Code Summary</h3>
            </div>
            {description ? (
              <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                AI가 분석한 코드 요약 정보가 없습니다.
              </p>
            )}
            {filePath && (
              <p className="text-xs text-gray-400 font-mono mt-3 bg-white/60 rounded px-2 py-1 truncate">
                {filePath}
              </p>
            )}
          </div>

          {/* Commit History */}
          <div>
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3>Recent History</h3>
              {!isCommitsLoading && commits.length > 0 && (
                <span className="text-xs text-gray-400 font-normal ml-auto">
                  {commits.length}개의 커밋
                </span>
              )}
            </div>

            {/* 로딩 스켈레톤 */}
            {isCommitsLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-gray-100 animate-pulse">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-gray-200" />
                    <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* 빈 상태 */}
            {!isCommitsLoading && commits.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">이 파일과 연관된 커밋이 없습니다.</p>
              </div>
            )}

            {/* 실제 커밋 리스트 */}
            {!isCommitsLoading && commits.length > 0 && (
              <div className="space-y-4">
                {commits.map((commit, index) => (
                  <div key={commit.sha ?? index} className="relative pl-4 border-l-2 border-gray-200">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-300 border-2 border-white" />
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <span className="text-sm font-medium text-gray-900 leading-snug break-all">
                        {commit.message || '(커밋 메시지 없음)'}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">
                        {formatDate(commit.date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <AuthorAvatar name={commit.author} />
                        <span>{commit.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* SHA 배지 */}
                        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                          {commit.sha}
                        </span>
                        {/* GitHub 링크 */}
                        {commit.url && (
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            title="GitHub에서 보기"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
