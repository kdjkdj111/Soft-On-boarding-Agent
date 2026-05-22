import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 중앙 집중식 API Fetcher
 * 모든 API 요청은 이 함수를 통과하며, JWT 토큰 주입 및 401 Unauthorized 에러 처리를 담당합니다.
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = useAuthStore.getState().token;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // DB 초기화 등으로 백엔드에서 401을 반환하는 경우 방어 로직
  if (response.status === 401) {
    console.warn('[apiFetch] 401 Unauthorized 감지 - 세션 만료됨. 로그아웃 처리합니다.');
    const { logout } = useAuthStore.getState();
    logout();
    
    // 현재 로그인 페이지가 아니라면 로그인 페이지로 강제 리다이렉트
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return response;
};
