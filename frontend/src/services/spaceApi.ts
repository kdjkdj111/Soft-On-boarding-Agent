import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 공통 Fetch 옵션 생성기 (JWT 포함)
const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface CreateSpaceRequest {
  name: string;
  repoUrl: string;
  jobRole: string;
}

export interface JoinSpaceRequest {
  teamCode: string;
  jobRole: string;
}

export interface MemberResponse {
  userId: number;
  username: string;
  email: string;
  jobRole: string;
  isAdmin: boolean;
}

export interface CreateSpaceResponse {
  spaceId: number;
  teamCode: string;
}

export const spaceApi = {
  createSpace: async (data: CreateSpaceRequest): Promise<CreateSpaceResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '팀 스페이스 생성에 실패했습니다.');
    }

    return response.json();
  },

  joinSpace: async (teamCode: string, jobRole: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ teamCode, jobRole }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '팀 스페이스 참여에 실패했습니다.');
    }
  },

  leaveSpace: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/leave`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(errorData.message || '팀 탈퇴에 실패했습니다.');
    }
  },

  getMembers: async (spaceId: number): Promise<MemberResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/${spaceId}/members`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '팀원 목록 조회에 실패했습니다.');
    }

    return response.json();
  },

  assignAdmin: async (spaceId: number, userId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/${spaceId}/members/${userId}/assign-admin`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '관리자 지정에 실패했습니다.');
    }
  },

  kickMember: async (spaceId: number, userId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/${spaceId}/members/${userId}/kick`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '팀원 추방에 실패했습니다.');
    }
  },
};
