import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: { teamCode: string | null; spaceId: number | null; isAdmin: boolean } | null;
  login: (token: string, user?: { teamCode: string | null; spaceId: number | null; isAdmin: boolean }) => void;
  logout: () => void;
  setTeamCode: (teamCode: string | null) => void;
  setSpaceId: (spaceId: number | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: (token, user = { teamCode: null, spaceId: null, isAdmin: false }) =>
        set({ isAuthenticated: true, token, user }),
      logout: () => 
        set({ isAuthenticated: false, token: null, user: null }),
      setTeamCode: (teamCode) =>
        set((state) => ({ user: state.user ? { ...state.user, teamCode } : { teamCode, spaceId: null, isAdmin: false } })),
      setSpaceId: (spaceId) =>
        set((state) => ({ user: state.user ? { ...state.user, spaceId } : { teamCode: null, spaceId, isAdmin: false } })),
      setIsAdmin: (isAdmin) =>
        set((state) => ({ user: state.user ? { ...state.user, isAdmin } : { teamCode: null, spaceId: null, isAdmin } })),
    }),
    {
      name: 'auth-storage', // 브라우저 localStorage에 저장
    }
  )
);
