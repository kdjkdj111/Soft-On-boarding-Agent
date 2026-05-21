import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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

export const functionalViewApi = {
  getFunctionalView: async (spaceId: number): Promise<FunctionalViewResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/spaces/${spaceId}/functional-view`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Functional View 데이터를 가져오는 데 실패했습니다.');
    }

    return response.json();
  },
};
