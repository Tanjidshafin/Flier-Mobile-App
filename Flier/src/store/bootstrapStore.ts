import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../config/env';

type BootstrapState = {
  hasCompletedOnboarding: boolean;
  hasHydrated: boolean;
  completeOnboarding: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useBootstrapStore = create<BootstrapState>()(
  persist(
    set => ({
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      hasCompletedOnboarding: false,
      hasHydrated: false,
      setHasHydrated: value => set({ hasHydrated: value }),
    }),
    {
      name: STORAGE_KEYS.onboardingCompleted,
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
      partialize: state => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
