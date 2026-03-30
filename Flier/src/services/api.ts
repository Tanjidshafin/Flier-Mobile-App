import axios, { AxiosError } from 'axios';

import { API_BASE_URL } from '../config/env';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  AuthSession,
  LoginPayload,
  RegisterPayload,
} from '../types/auth';
import { BookingPayload, BookingSummary } from '../types/booking';
import {
  DestinationSuggestion,
  HomePayload,
  HotelDetails,
  HotelSearchResponse,
  SearchFilters,
  WishlistEntry,
} from '../types/hotel';

let authTokenResolver: () => string | null = () => null;

export class ApiError extends Error {
  errors?: string[];
  statusCode?: number;

  constructor(message: string, statusCode?: number, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
    this.statusCode = statusCode;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
});

apiClient.interceptors.request.use(config => {
  const token = authTokenResolver();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function normalizeError(error: unknown): never {
  if (error instanceof ApiError) {
    throw error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Something went wrong.';

    throw new ApiError(
      message,
      axiosError.response?.status,
      axiosError.response?.data?.errors,
    );
  }

  throw new ApiError('Something went wrong.');
}

async function request<T>(path: string, params?: object) {
  try {
    const response = await apiClient.get<ApiSuccessResponse<T>>(path, { params });
    return response.data.data;
  } catch (error) {
    normalizeError(error);
  }
}

async function send<T>(method: 'post' | 'delete', path: string, data?: object) {
  try {
    const response = await apiClient[method]<ApiSuccessResponse<T>>(path, data);
    return response.data.data;
  } catch (error) {
    normalizeError(error);
  }
}

export function registerAuthTokenResolver(resolver: () => string | null) {
  authTokenResolver = resolver;
}

export async function registerUser(payload: RegisterPayload) {
  return send<AuthSession>('post', '/auth/register', payload);
}

export async function loginUser(payload: LoginPayload) {
  return send<AuthSession>('post', '/auth/login', payload);
}

export async function fetchCurrentUser() {
  return request<AuthSession>('/auth/me');
}

export async function fetchHomeData() {
  return request<HomePayload>('/home');
}

export async function fetchDestinationSuggestions(query: string) {
  return request<DestinationSuggestion[]>('/destinations/suggestions', { q: query });
}

export async function fetchHotels(filters: SearchFilters) {
  return request<HotelSearchResponse>('/hotels', {
    adults: filters.adults,
    amenities: filters.amenities.join(','),
    checkIn: filters.checkIn,
    checkOut: filters.checkOut,
    children: filters.children,
    destinationId: filters.destinationId,
    maxPrice: filters.maxPrice,
    minPrice: filters.minPrice,
    minRating: filters.minRating,
    query: filters.query,
    rooms: filters.rooms,
    sortBy: filters.sortBy,
  });
}

export async function fetchHotelDetails(slug: string) {
  return request<HotelDetails>(`/hotels/${slug}`);
}

export async function fetchWishlist() {
  return request<WishlistEntry[]>('/wishlist');
}

export async function syncWishlist(hotelIds: string[]) {
  return send<WishlistEntry[]>('post', '/wishlist/sync', { hotelIds });
}

export async function addWishlistHotel(hotelId: string) {
  return send<WishlistEntry[]>('post', `/wishlist/${hotelId}`);
}

export async function removeWishlistHotel(hotelId: string) {
  return send<WishlistEntry[]>('delete', `/wishlist/${hotelId}`);
}

export async function fetchBookings() {
  return request<BookingSummary[]>('/bookings');
}

export async function fetchBooking(bookingId: string) {
  return request<BookingSummary>(`/bookings/${bookingId}`);
}

export async function createBooking(payload: BookingPayload) {
  return send<{ booking: BookingSummary; user: AuthSession['user'] }>(
    'post',
    '/bookings',
    payload,
  );
}
