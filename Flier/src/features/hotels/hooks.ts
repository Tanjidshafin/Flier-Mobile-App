import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  fetchDestinationSuggestions,
  fetchHomeData,
  fetchHotelDetails,
  fetchHotels,
} from '../../services/api';
import { HotelSearchParams, HotelSearchResponse } from '../../types/hotel';

export function useHomeQuery() {
  return useQuery({
    queryFn: fetchHomeData,
    queryKey: ['home'],
  });
}

export function useDestinationSuggestions(searchText: string) {
  return useQuery({
    enabled: searchText.trim().length >= 2,
    queryFn: () => fetchDestinationSuggestions(searchText.trim()),
    queryKey: ['destination-suggestions', searchText.trim()],
    staleTime: 60 * 1000,
  });
}

export function useInfiniteHotelSearch(params: HotelSearchParams, enabled: boolean) {
  return useInfiniteQuery<
    HotelSearchResponse,
    Error,
    InfiniteData<HotelSearchResponse, string | null>,
    [string, HotelSearchParams],
    string | null
  >({
    enabled,
    getNextPageParam: lastPage => lastPage.pagination.nextCursor || undefined,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchHotels({
        ...params,
        cursor: pageParam,
      }),
    queryKey: ['hotels', params],
  });
}

export function useHotelDetailsQuery(
  slug: string,
  dates?: { checkIn?: string; checkOut?: string },
) {
  return useQuery({
    enabled: Boolean(slug),
    queryFn: () => fetchHotelDetails(slug, dates),
    queryKey: ['hotel-details', slug, dates?.checkIn || null, dates?.checkOut || null],
  });
}

export function useInvalidateHotelSearch() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: ['hotels'] });
}
