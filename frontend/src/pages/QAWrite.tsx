import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { qaService } from '../services/qaService';
import { ArrowLeft, Save } from 'lucide-react';

import { useAuthStore } from '../store/authStore';

export function QAWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const spaceId = useAuthStore(state => state.user?.spaceId);
  
  const editPostId = location.state?.id;
  const initialTitle = location.state?.title || '';
  const initialContent = location.state?.content || '';

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      if (editPostId) {
        await qaService.updatePost(editPostId, title, content);
        navigate(`/qa/${editPostId}`);
      } else {
        if (!spaceId) {
          alert('팀 스페이스 정보가 없습니다. 다시 시도해주세요.');
          return;
        }
        const newPost = await qaService.createPost(spaceId, title, content);
        navigate(`/qa/${newPost.id}`);
      }
    } catch (error) {
      console.error('Failed to save post', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {editPostId ? '글 수정하기' : '새 글 쓰기'}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="제목을 입력하세요"
              required
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="내용을 입력하세요"
              required
            />
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {editPostId ? '수정 완료' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
