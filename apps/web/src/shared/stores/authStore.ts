import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CurrentUser } from '../types';

interface AuthState {
  token: string | null;
  user: CurrentUser | null;
  setAuth: (token: string, user: CurrentUser) => void;
  setUser: (user: CurrentUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'dollyvault-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
