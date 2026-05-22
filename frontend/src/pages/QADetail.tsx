import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qaService, type QaPostDetail } from '../services/qaService';
import { userApi } from '../services/userApi';
import { ArrowLeft, Edit2, Trash2, Send } from 'lucide-react';

export function QADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<QaPostDetail | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost(Number(id));
    }
    userApi.getProfile().then(profile => setCurrentUserName(profile.userName)).catch(() => {});
  }, [id]);

  const loadPost = async (postId: number) => {
    try {
      const data = await qaService.getPost(postId);
      setPost(data);
    } catch (error) {
      console.error('Failed to load post', error);
      alert('게시글을 불러올 수 없습니다.');
      navigate('/qa');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await qaService.deletePost(Number(id));
      navigate('/qa');
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setIsSubmitting(true);
    try {
      await qaService.createComment(Number(id), newComment);
      setNewComment('');
      loadPost(Number(id)); // Reload comments
    } catch (error) {
      alert('댓글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await qaService.deleteComment(commentId);
      loadPost(Number(id));
    } catch (error) {
      alert('댓글 삭제 실패');
    }
  };

  if (!post) {
    return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
  }

  // userApi 응답의 userName이 백엔드의 username 이고, QaPostDetail의 authorName도 백엔드의 username을 반환
  const isAuthor = currentUserName === post.authorName;

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        
        {/* Post Header & Actions */}
        <div className="flex justify-between items-start">
          <button
            onClick={() => navigate('/qa')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            목록으로
          </button>
          
          {isAuthor && (
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/qa/write', { state: { id: post.id, title: post.title, content: post.content } })}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" /> 수정
              </button>
              <button 
                onClick={handleDeletePost}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" /> 삭제
              </button>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {post.authorProfileImage ? (
                <img src={post.authorProfileImage} alt={post.authorName} className="w-8 h-8 rounded-full bg-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200" />
              )}
              <span className="font-medium text-gray-700">{post.authorName}</span>
            </div>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[200px]">
            {post.content}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            댓글 <span className="text-blue-600">{post.comments.length}</span>
          </h3>

          <div className="space-y-6 mb-8">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex flex-col border-b border-gray-100 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {comment.authorProfileImage ? (
                      <img src={comment.authorProfileImage} alt={comment.authorName} className="w-6 h-6 rounded-full bg-gray-200" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200" />
                    )}
                    <span className="font-semibold text-gray-800">{comment.authorName}</span>
                    <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  {currentUserName === comment.authorName && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 남겨보세요."
              className="flex-1 min-h-[80px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 self-end flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> 등록
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
