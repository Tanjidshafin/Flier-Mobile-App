import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelBooking,
  completeBooking,
  fetchBooking,
  fetchBookings,
  holdBooking,
} from '../../services/api';

export function useBookingsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: fetchBookings,
    queryKey: ['bookings'],
  });
}

export function useBookingQuery(bookingId: string) {
  return useQuery({
    enabled: Boolean(bookingId),
    queryFn: () => fetchBooking(bookingId),
    queryKey: ['booking', bookingId],
  });
}

export function useHoldBookingMutation() {
  return useMutation({
    mutationFn: holdBooking,
  });
}

export function useCompleteBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload: Parameters<typeof completeBooking>[1];
    }) => completeBooking(bookingId, payload),
    onSuccess: booking => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.setQueryData(['booking', booking.id], booking);
    },
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: string;
      payload?: Parameters<typeof cancelBooking>[1];
    }) => cancelBooking(bookingId, payload),
    onSuccess: booking => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.setQueryData(['booking', booking.id], booking);
    },
  });
}
