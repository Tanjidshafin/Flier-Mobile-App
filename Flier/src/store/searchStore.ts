import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../config/env';
import { SearchFilters } from '../types/hotel';
import { addDays, toISODateString } from '../utils/date';

type SearchState = {
  filters: SearchFilters;
  destinationLabel: string;
  resetFilters: () => void;
  setDateRange: (checkIn: string, checkOut: string) => void;
  setDestination: (
    destinationId: string | undefined,
    destinationLabel?: string,
    query?: string,
  ) => void;
  setFilters: (patch: Partial<SearchFilters>) => void;
  setGuests: (adults: number, children: number, rooms: number) => void;
  setQuery: (query: string) => void;
};

const buildDefaultFilters = (): SearchFilters => ({
  adults: 2,
  amenities: [],
  checkIn: toISODateString(addDays(new Date(), 1)),
  checkOut: toISODateString(addDays(new Date(), 3)),
  children: 0,
  destinationId: undefined,
  maxPrice: undefined,
  minPrice: undefined,
  minRating: undefined,
  query: '',
  rooms: 1,
  sortBy: 'recommended',
});

export const useSearchStore = create<SearchState>()(
  persist(
    set => ({
      destinationLabel: '',
      filters: buildDefaultFilters(),
      resetFilters: () =>
        set({
          destinationLabel: '',
          filters: buildDefaultFilters(),
        }),
      setDateRange: (checkIn, checkOut) =>
        set(state => ({
          filters: {
            ...state.filters,
            checkIn,
            checkOut,
          },
        })),
      setDestination: (destinationId, destinationLabel, query) =>
        set(state => ({
          destinationLabel: destinationLabel ?? '',
          filters: {
            ...state.filters,
            destinationId,
            query: query ?? destinationLabel ?? '',
          },
        })),
      setFilters: patch =>
        set(state => ({
          filters: {
            ...state.filters,
            ...patch,
          },
        })),
      setGuests: (adults, children, rooms) =>
        set(state => ({
          filters: {
            ...state.filters,
            adults,
            children,
            rooms,
          },
        })),
      setQuery: query =>
        set(state => ({
          filters: {
            ...state.filters,
            query,
          },
        })),
    }),
    {
      name: STORAGE_KEYS.searchFilters,
      partialize: state => ({
        destinationLabel: state.destinationLabel,
        filters: state.filters,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
