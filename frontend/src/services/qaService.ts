import { apiFetch } from './apiClient';

export interface QaPost {
  id: number;
  title: string;
  authorName: string;
  authorProfileImage: string | null;
  createdAt: string;
  commentCount: number;
}

export interface QaComment {
  id: number;
  postId: number;
  content: string;
  authorId: number;
  authorName: string;
  authorProfileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QaPostDetail {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorProfileImage: string | null;
  createdAt: string;
  updatedAt: string;
  comments: QaComment[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const qaService = {
  getPosts: async (spaceId: number, page: number = 0): Promise<PageResponse<QaPost>> => {
    const params = new URLSearchParams({ spaceId: spaceId.toString(), page: page.toString(), size: '15' });
    const response = await apiFetch(`/api/v1/qa/posts?${params.toString()}`);
    return response.json();
  },

  getPost: async (id: number): Promise<QaPostDetail> => {
    const response = await apiFetch(`/api/v1/qa/posts/${id}`);
    return response.json();
  },

  createPost: async (spaceId: number, title: string, content: string): Promise<QaPost> => {
    const response = await apiFetch(`/api/v1/qa/posts?spaceId=${spaceId}`, {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
    return response.json();
  },

  updatePost: async (id: number, title: string, content: string): Promise<QaPostDetail> => {
    const response = await apiFetch(`/api/v1/qa/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
    return response.json();
  },

  deletePost: async (id: number): Promise<void> => {
    await apiFetch(`/api/v1/qa/posts/${id}`, { method: 'DELETE' });
  },

  createComment: async (postId: number, content: string): Promise<QaComment> => {
    const response = await apiFetch(`/api/v1/qa/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response.json();
  },

  updateComment: async (commentId: number, content: string): Promise<QaComment> => {
    const response = await apiFetch(`/api/v1/qa/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return response.json();
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await apiFetch(`/api/v1/qa/comments/${commentId}`, { method: 'DELETE' });
  },
};
