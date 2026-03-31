import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../config/env';
import { BookingDraft, BookingSummary } from '../types/booking';
import { HotelDetails, HotelSummary } from '../types/hotel';
import { useSearchStore } from './searchStore';

type BookingState = {
  draft: BookingDraft | null;
  hasHydrated: boolean;
  latestBooking: BookingSummary | null;
  clearDraft: () => void;
  setDraftFromHotel: (hotel: HotelSummary | HotelDetails) => void;
  setHasHydrated: (value: boolean) => void;
  setLatestBooking: (booking: BookingSummary | null) => void;
  updateDraft: (patch: Partial<BookingDraft>) => void;
};

export const useBookingStore = create<BookingState>()(
  persist(
    set => ({
      clearDraft: () => set({ draft: null }),
      draft: null,
      hasHydrated: false,
      latestBooking: null,
      setDraftFromHotel: hotel => {
        const filters = useSearchStore.getState().filters;
        const defaultRoomType =
          'roomTypes' in hotel && Array.isArray(hotel.roomTypes) && hotel.roomTypes.length > 0
            ? hotel.roomTypes[0]
            : null;

        set({
          draft: {
            adults: filters.adults,
            checkIn: filters.checkIn,
            checkOut: filters.checkOut,
            children: filters.children,
            currency: hotel.price.currency,
            hotelId: hotel.id,
            hotelImage: hotel.image,
            hotelName: hotel.name,
            hotelSlug: hotel.slug,
            locationLabel: hotel.locationLabel,
            nightlyRate: hotel.price.amount,
            roomCount: filters.rooms,
            roomTypeId: defaultRoomType?.code || 'signature-suite',
            roomTypeImage: defaultRoomType?.image || hotel.image,
            roomTypeName: defaultRoomType?.name || 'Signature Room',
          },
        });
      },
      setHasHydrated: value => set({ hasHydrated: value }),
      setLatestBooking: booking => set({ latestBooking: booking }),
      updateDraft: patch =>
        set(state => ({
          draft: state.draft
            ? {
                ...state.draft,
                ...patch,
              }
            : null,
        })),
    }),
    {
      name: STORAGE_KEYS.bookingDraft,
      onRehydrateStorage: () => state => {
        state?.setHasHydrated(true);
      },
      partialize: state => ({
        draft: state.draft,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
