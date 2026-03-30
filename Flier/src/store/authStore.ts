import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../config/env';
import { fetchCurrentUser, loginUser, registerAuthTokenResolver, registerUser } from '../services/api';
import { AuthSession, LoginPayload, RegisterPayload } from '../types/auth';

type AuthState = {
  hasHydrated: boolean;
  isSubmitting: boolean;
  session: AuthSession | null;
  hydrateSession: () => Promise<void>;
  setHasHydrated: (value: boolean) => void;
  signIn: (payload: LoginPayload) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<AuthSession>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      isSubmitting: false,
      session: null,
      hydrateSession: async () => {
        const session = get().session;

        if (!session?.token) {
          return;
        }

        try {
          const refreshedSession = await fetchCurrentUser();
          set({ session: refreshedSession });
        } catch {
          set({ session: null });
        }
      },
      setHasHydrated: value => set({ hasHydrated: value }),
      signIn: async payload => {
        set({ isSubmitting: true });
        try {
          const session = await loginUser(payload);
          set({ session });
          return session;
        } finally {
          set({ isSubmitting: false });
        }
      },
      signOut: async () => {
        set({ session: null });
      },
      signUp: async payload => {
        set({ isSubmitting: true });
        try {
          const session = await registerUser(payload);
          set({ session });
          return session;
        } finally {
          set({ isSubmitting: false });
        }
      },
    }),
    {
      name: STORAGE_KEYS.authSession,
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
      partialize: state => ({
        session: state.session,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

registerAuthTokenResolver(() => useAuthStore.getState().session?.token ?? null);
