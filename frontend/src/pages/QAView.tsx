import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { qaService } from '../services/qaService';
import type { QaPost, PageResponse } from '../services/qaService';
import { Plus, MessageSquare } from 'lucide-react';

import { useAuthStore } from '../store/authStore';

export function QAView() {
  const navigate = useNavigate();
  const spaceId = useAuthStore(state => state.user?.spaceId);
  const [pageData, setPageData] = useState<PageResponse<QaPost> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (spaceId) {
      loadPosts(spaceId, currentPage);
    }
  }, [spaceId, currentPage]);

  const loadPosts = async (currentSpaceId: number, page: number) => {
    try {
      const data = await qaService.getPosts(currentSpaceId, page);
      setPageData(data);
    } catch (error) {
      console.error('Failed to load posts', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Q&A 게시판</h2>
          <p className="text-gray-500 mt-1">질문과 답변을 나누는 공간입니다.</p>
        </div>
        <button
          onClick={() => navigate('/qa/write')}
          disabled={!spaceId}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          <Plus className="w-5 h-5" />
          글쓰기
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="py-3 px-6 w-48">작성자</th>
                <th className="py-3 px-6">제목</th>
                <th className="py-3 px-6 w-32 text-center">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!spaceId && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-500">
                    좌측에서 팀 스페이스를 먼저 선택해주세요.
                  </td>
                </tr>
              )}
              {spaceId && pageData?.content.map((post) => (
                <tr 
                  key={post.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/qa/${post.id}`)}
                >
                  <td className="py-4 px-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      {post.authorProfileImage ? (
                        <img src={post.authorProfileImage} alt={post.authorName} className="w-6 h-6 rounded-full bg-gray-200" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                      )}
                      {post.authorName}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{post.title}</span>
                      {post.commentCount > 0 && (
                        <span className="flex items-center text-blue-600 text-xs font-semibold gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.commentCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500 text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {spaceId && pageData?.content.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-gray-500">
                    등록된 글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageData && pageData.totalPages > 1 && (
          <div className="flex items-center justify-center py-4 border-t border-gray-200 gap-2">
            <button
              disabled={pageData.number === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {pageData.number + 1} / {pageData.totalPages}
            </span>
            <button
              disabled={pageData.number === pageData.totalPages - 1}
              onClick={() => setCurrentPage((p) => Math.min(pageData.totalPages - 1, p + 1))}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
