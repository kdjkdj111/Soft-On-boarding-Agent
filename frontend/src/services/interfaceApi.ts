import { apiFetch } from './apiClient';

export interface InterfaceViewDto {
  id: number;
  filePath: string;
  elementType: string;
  name: string;
  description: string;
  extraInfo: string;
}

export interface CommitHistoryDto {
  id: number;
  commitSha: string;
  message: string;
  commitDate: string;
  author: string;
}

export const interfaceApi = {
  getInterfaceView: async (spaceId: number): Promise<InterfaceViewDto[]> => {
    const response = await apiFetch(`/api/spaces/${spaceId}/interface-view`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '인터페이스 뷰 데이터를 불러오는데 실패했습니다.');
    }

    return response.json();
  },
  
  getCommitHistory: async (spaceId: number): Promise<CommitHistoryDto[]> => {
    const response = await apiFetch(`/api/spaces/${spaceId}/commit-history`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '커밋 기록 데이터를 불러오는데 실패했습니다.');
    }

    return response.json();
  },
};
