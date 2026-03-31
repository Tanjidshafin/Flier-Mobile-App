import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  addWishlistHotel,
  fetchWishlist,
  removeWishlistHotel,
  syncWishlist,
} from '../services/api';
import { HotelSummary, WishlistEntry } from '../types/hotel';
import { STORAGE_KEYS } from '../config/env';
import { useAuthStore } from './authStore';

type WishlistState = {
  guestItems: HotelSummary[];
  hasHydrated: boolean;
  isSyncing: boolean;
  remoteItems: WishlistEntry[];
  addGuestItem: (hotel: HotelSummary) => void;
  hydrateRemoteWishlist: () => Promise<void>;
  isSaved: (hotelId: string) => boolean;
  removeGuestItem: (hotelId: string) => void;
  setHasHydrated: (value: boolean) => void;
  syncGuestWishlist: () => Promise<void>;
  toggleSaved: (hotel: HotelSummary) => Promise<void>;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      addGuestItem: hotel =>
        set(state => ({
          guestItems: state.guestItems.some(item => item.id === hotel.id)
            ? state.guestItems
            : [hotel, ...state.guestItems],
        })),
      guestItems: [],
      hasHydrated: false,
      hydrateRemoteWishlist: async () => {
        const session = useAuthStore.getState().session;
        if (!session) {
          set({ remoteItems: [] });
          return;
        }

        const remoteItems = await fetchWishlist();
        set({ remoteItems });
      },
      isSaved: hotelId => {
        const session = useAuthStore.getState().session;
        if (session) {
          return get().remoteItems.some(item => item.hotel.id === hotelId);
        }
        return get().guestItems.some(item => item.id === hotelId);
      },
      isSyncing: false,
      remoteItems: [],
      removeGuestItem: hotelId =>
        set(state => ({
          guestItems: state.guestItems.filter(item => item.id !== hotelId),
        })),
      setHasHydrated: value => set({ hasHydrated: value }),
      syncGuestWishlist: async () => {
        const session = useAuthStore.getState().session;
        if (!session) {
          return;
        }

        const hotelIds = get().guestItems.map(item => item.id);
        set({ isSyncing: true });

        try {
          const remoteItems =
            hotelIds.length > 0 ? await syncWishlist(hotelIds) : await fetchWishlist();
          set({ remoteItems });
        } finally {
          set({ isSyncing: false });
        }
      },
      toggleSaved: async hotel => {
        const session = useAuthStore.getState().session;

        if (!session) {
          if (get().guestItems.some(item => item.id === hotel.id)) {
            get().removeGuestItem(hotel.id);
          } else {
            get().addGuestItem(hotel);
          }
          return;
        }

        set({ isSyncing: true });
        try {
          const isSaved = get().remoteItems.some(item => item.hotel.id === hotel.id);
          const remoteItems = isSaved
            ? await removeWishlistHotel(hotel.id)
            : await addWishlistHotel(hotel.id);

          set({ remoteItems });
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: STORAGE_KEYS.guestWishlist,
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
      partialize: state => ({
        guestItems: state.guestItems,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
