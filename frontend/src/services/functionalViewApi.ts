import { apiFetch } from './apiClient';

export interface FunctionalNodeData {
  label: string;
  description?: string;
  filePath?: string;
  apiMethod?: string;
  apiUrl?: string;
}

export interface FunctionalViewNode {
  id: string;
  type: 'forestNode' | 'treeNode' | 'ringNode';
  parentId?: string | null;
  data: FunctionalNodeData;
}

export interface FunctionalViewEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface FunctionalViewResponse {
  nodes: FunctionalViewNode[];
  edges: FunctionalViewEdge[];
}

/** 노드 클릭 시 커밋 히스토리 드로어에 표시할 커밋 정보 */
export interface CommitSummary {
  /** 7자리 short SHA */
  sha: string;
  /** 커밋 메시지 (첫 줄) */
  message: string;
  /** 커밋 작성자 이름 */
  author: string;
  /** 커밋 날짜 (ISO 8601) */
  date: string;
  /** GitHub 커밋 페이지 URL */
  url?: string;
}

export const functionalViewApi = {
  getFunctionalView: async (spaceId: number): Promise<FunctionalViewResponse> => {
    const response = await apiFetch(`/api/spaces/${spaceId}/functional-view`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Functional View 데이터를 가져오는 데 실패했습니다.');
    }

    return response.json();
  },

  /**
   * 특정 노드(elementId)를 클릭했을 때 해당 파일의 커밋 히스토리를 조회합니다.
   * 백엔드에서 GitHub API의 ?path= 필터를 사용하여 정확한 파일별 커밋을 반환합니다.
   * 서버 측 캐시(Caffeine, 10분)가 적용되어 재클릭 시 즉시 응답합니다.
   *
   * FOREST 노드처럼 filePath가 없는 경우 빈 배열을 반환합니다.
   */
  getCommitsForElement: async (spaceId: number, elementId: number): Promise<CommitSummary[]> => {
    const response = await apiFetch(
      `/api/spaces/${spaceId}/functional-elements/${elementId}/commits`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      // 404나 403은 빈 배열로 처리 (커밋 없음으로 간주)
      if (response.status === 404 || response.status === 403) return [];
      throw new Error('커밋 히스토리를 가져오는 데 실패했습니다.');
    }

    return response.json();
  },
};

