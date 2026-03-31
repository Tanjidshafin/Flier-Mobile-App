import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../config/env';
import { SearchFilters } from '../types/hotel';
import { addDays, toISODateString } from '../utils/date';

type SearchState = {
  filters: SearchFilters;
  destinationLabel: string;
  searchText: string;
  resetFilters: () => void;
  setDateRange: (checkIn: string, checkOut: string) => void;
  setDestination: (
    destinationId: string | undefined,
    destinationLabel?: string,
    searchText?: string,
  ) => void;
  setFilters: (patch: Partial<SearchFilters>) => void;
  setGuests: (adults: number, children: number, rooms: number) => void;
  setSearchText: (searchText: string) => void;
};

const buildDefaultFilters = (): SearchFilters => ({
  adults: 2,
  amenities: [],
  checkIn: toISODateString(addDays(new Date(), 1)),
  checkOut: toISODateString(addDays(new Date(), 3)),
  children: 0,
  destinationId: undefined,
  destinationLabel: '',
  maxPrice: undefined,
  minPrice: undefined,
  minRating: undefined,
  searchText: '',
  rooms: 1,
  sortBy: 'recommended',
});

export const useSearchStore = create<SearchState>()(
  persist(
    set => ({
      destinationLabel: '',
      filters: buildDefaultFilters(),
      searchText: '',
      resetFilters: () =>
        set({
          destinationLabel: '',
          filters: buildDefaultFilters(),
          searchText: '',
        }),
      setDateRange: (checkIn, checkOut) =>
        set(state => ({
          filters: {
            ...state.filters,
            checkIn,
            checkOut,
          },
        })),
      setDestination: (destinationId, destinationLabel, searchText) =>
        set(state => ({
          destinationLabel: destinationLabel ?? '',
          searchText: searchText ?? '',
          filters: {
            ...state.filters,
            destinationId,
            destinationLabel: destinationLabel ?? '',
            searchText: searchText ?? '',
          },
        })),
      setFilters: patch =>
        set(state => ({
          filters: {
            ...state.filters,
            ...patch,
          },
          destinationLabel:
            patch.destinationLabel !== undefined
              ? patch.destinationLabel
              : state.destinationLabel,
          searchText:
            patch.searchText !== undefined
              ? patch.searchText
              : state.searchText,
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
      setSearchText: searchText =>
        set(state => ({
          searchText,
          filters: {
            ...state.filters,
            searchText,
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
