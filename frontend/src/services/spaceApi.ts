import { apiFetch } from './apiClient';

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


// ---- Functional View DTO ----
export interface FunctionalViewNodeDto {
  id: string;
  type: string; // 'forestNode', 'treeNode', 'ringNode'
  parentId?: string | null;
  data: Record<string, any>;
  position: { x: number; y: number };
}

export interface FunctionalViewEdgeDto {
  id: string;
  source: string;
  target: string;
  animated: boolean;
}

export interface FunctionalViewResponseDto {
  nodes: FunctionalViewNodeDto[];
  edges: FunctionalViewEdgeDto[];
}

export const spaceApi = {
  // ======================================================================
  // Space
  // ======================================================================

  createSpace: async (data: CreateSpaceRequest): Promise<CreateSpaceResponse> => {
    const response = await apiFetch(`/api/spaces`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '팀 스페이스 생성에 실패했습니다.');
    }

    return response.json();
  },

  joinSpace: async (teamCode: string, jobRole: string): Promise<void> => {
    const response = await apiFetch(`/api/spaces/join`, {
      method: 'POST',
      body: JSON.stringify({ teamCode, jobRole }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '팀 스페이스 참여에 실패했습니다.');
    }
  },

  leaveSpace: async (): Promise<void> => {
    const response = await apiFetch(`/api/spaces/leave`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '팀 탈퇴에 실패했습니다.');
    }
  },


  // ======================================================================
  // Functional View — AI 파이프라인 분석 데이터 조회
  // ======================================================================

  getFunctionalView: async (spaceId: number): Promise<FunctionalViewResponseDto> => {
    const response = await apiFetch(`/api/spaces/${spaceId}/functional-view`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Functional View 데이터를 불러오는데 실패했습니다.');
    }

    return response.json();
  },

  // ======================================================================
  // Members — 멤버 관리
  // ======================================================================

  getMembers: async (spaceId: number): Promise<MemberResponse[]> => {
    const response = await apiFetch(`/api/spaces/${spaceId}/members`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '팀원 목록 조회에 실패했습니다.');
    }

    return response.json();
  },

  assignAdmin: async (spaceId: number, userId: number): Promise<void> => {
    const response = await apiFetch(`/api/spaces/${spaceId}/members/${userId}/assign-admin`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '관리자 지정에 실패했습니다.');
    }
  },

  kickMember: async (spaceId: number, userId: number): Promise<void> => {
    const response = await apiFetch(`/api/spaces/${spaceId}/members/${userId}/kick`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '팀원 추방에 실패했습니다.');
    }
  },
};
