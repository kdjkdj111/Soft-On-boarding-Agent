import { useAuthStore } from '../../../store/authStore';
import type { CommitHistoryDto, BoardTaskDto, BoardTaskStatus } from '../dto/flowviewDto';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const flowviewApi = {
  // ======================================================================
  // Commits
  // ======================================================================

  getCommits: async (teamCode: string): Promise<CommitHistoryDto[]> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/${teamCode}/commits`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '커밋 내역을 불러오는데 실패했습니다.');
    }

    return response.json();
  },

  syncCommits: async (teamCode: string): Promise<CommitHistoryDto[]> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/${teamCode}/commits/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '커밋 동기화에 실패했습니다.');
    }

    return response.json();
  },

  // ======================================================================
  // BoardTask CRUD
  // ======================================================================

  getTasks: async (teamCode: string): Promise<BoardTaskDto[]> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/${teamCode}/tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '태스크를 불러오는데 실패했습니다.');
    }

    return response.json();
  },

  createTask: async (teamCode: string, title: string): Promise<BoardTaskDto> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/${teamCode}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, status: 'TODO' }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '태스크 생성에 실패했습니다.');
    }

    return response.json();
  },

  updateTaskStatus: async (
    teamCode: string,
    taskId: number,
    status: BoardTaskStatus
  ): Promise<BoardTaskDto> => {
    const response = await fetch(
      `${API_BASE_URL}/api/spaces/${teamCode}/tasks/${taskId}/status`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '태스크 상태 변경에 실패했습니다.');
    }

    return response.json();
  },

  deleteTask: async (taskId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '태스크 삭제에 실패했습니다.');
    }
  },
};
