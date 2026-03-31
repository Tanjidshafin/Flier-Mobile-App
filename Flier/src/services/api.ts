import axios, { AxiosError } from 'axios';

import { API_BASE_URL } from '../config/env';
import {
  AdminConversation,
  AdminConversationMessagesPayload,
  AdminDashboardPayload,
  AdminHotel,
  AdminHotelPayload,
  AdminListResponse,
  AdminUser,
} from '../types/admin';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  AuthSession,
  LoginPayload,
  RegisterPayload,
} from '../types/auth';
import {
  BookingActionPayload,
  BookingHoldResponse,
  BookingPayload,
  BookingSummary,
} from '../types/booking';
import { Conversation, ChatMessage } from '../types/chat';
import {
  DestinationSuggestion,
  HomePayload,
  HotelDetails,
  HotelSearchParams,
  HotelSearchResponse,
  WishlistEntry,
} from '../types/hotel';
import { NotificationItem } from '../types/notification';

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
  timeout: 15000,
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

function ensureObject(value: unknown, message = 'Unexpected API response.') {
  if (!value || typeof value !== 'object') {
    throw new ApiError(message);
  }

  return value as Record<string, unknown>;
}

function normalizeHotelSearchResponse(payload: unknown): HotelSearchResponse {
  const data = ensureObject(payload);
  return {
    items: Array.isArray(data.items) ? data.items : [],
    pagination: ensureObject(data.pagination) as HotelSearchResponse['pagination'],
  };
}

function normalizeBookingHoldResponse(payload: unknown): BookingHoldResponse {
  const data = ensureObject(payload);
  return {
    booking: ensureObject(data.booking) as BookingSummary,
    paymentSession: ensureObject(data.paymentSession) as BookingHoldResponse['paymentSession'],
  };
}

async function request<T>(path: string, params?: object) {
  try {
    const response = await apiClient.get<ApiSuccessResponse<T>>(path, { params });
    return response.data.data;
  } catch (error) {
    normalizeError(error);
  }
}

async function mutate<T>(
  method: 'post' | 'patch' | 'delete',
  path: string,
  data?: object,
) {
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
  return mutate<AuthSession>('post', '/auth/register', payload);
}

export async function loginUser(payload: LoginPayload) {
  return mutate<AuthSession>('post', '/auth/login', payload);
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

export async function fetchHotels(filters: HotelSearchParams) {
  const response = await request<HotelSearchResponse>('/hotels', {
    adults: filters.adults,
    amenities: filters.amenities.join(','),
    checkIn: filters.checkIn,
    checkOut: filters.checkOut,
    children: filters.children,
    cursor: filters.cursor,
    destinationId: filters.destinationId,
    limit: filters.limit,
    maxPrice: filters.maxPrice,
    minPrice: filters.minPrice,
    minRating: filters.minRating,
    rooms: filters.rooms,
    searchText: filters.searchText,
    sortBy: filters.sortBy,
  });

  return normalizeHotelSearchResponse(response);
}

export async function fetchHotelDetails(
  slug: string,
  params?: { checkIn?: string; checkOut?: string },
) {
  return request<HotelDetails>(`/hotels/${slug}`, params);
}

export async function fetchWishlist() {
  return request<WishlistEntry[]>('/wishlist');
}

export async function syncWishlist(hotelIds: string[]) {
  return mutate<WishlistEntry[]>('post', '/wishlist/sync', { hotelIds });
}

export async function addWishlistHotel(hotelId: string) {
  return mutate<WishlistEntry[]>('post', `/wishlist/${hotelId}`);
}

export async function removeWishlistHotel(hotelId: string) {
  return mutate<WishlistEntry[]>('delete', `/wishlist/${hotelId}`);
}

export async function fetchBookings() {
  return request<BookingSummary[]>('/bookings');
}

export async function fetchBooking(bookingId: string) {
  return request<BookingSummary>(`/bookings/${bookingId}`);
}

export async function createBooking(payload: BookingPayload) {
  return mutate<{ booking: BookingSummary; user: AuthSession['user'] }>(
    'post',
    '/bookings',
    payload,
  );
}

export async function holdBooking(payload: BookingPayload) {
  const response = await mutate<BookingHoldResponse>('post', '/bookings/hold', payload);
  return normalizeBookingHoldResponse(response);
}

export async function completeBooking(bookingId: string, payload: BookingActionPayload) {
  return mutate<BookingSummary>('post', `/bookings/${bookingId}/complete`, payload);
}

export async function cancelBooking(bookingId: string, payload: BookingActionPayload = {}) {
  return mutate<BookingSummary>('post', `/bookings/${bookingId}/cancel`, payload);
}

export async function updateProfile(payload: {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
}) {
  return mutate<{
    session: AuthSession;
    user: AuthSession['user'];
  }>('patch', '/users/me', payload);
}

export async function createAvatarUploadSignature() {
  return mutate<{
    apiKey: string;
    cloudName: string;
    folder: string;
    publicId: string;
    signature: string;
    timestamp: number;
  }>('post', '/uploads/avatar-signature');
}

export async function createHotelImageUploadSignature() {
  return mutate<{
    apiKey: string;
    cloudName: string;
    folder: string;
    publicId: string;
    signature: string;
    timestamp: number;
  }>('post', '/uploads/hotel-image-signature');
}

export async function fetchNotifications() {
  return request<NotificationItem[]>('/notifications');
}

export async function markNotificationRead(notificationId: string) {
  return mutate<NotificationItem>('patch', `/notifications/${notificationId}/read`);
}

export async function deleteNotification(notificationId: string) {
  return mutate<{ id: string }>('delete', `/notifications/${notificationId}`);
}

export async function registerDevice(payload: { platform: string; token: string }) {
  return mutate<{ platform: string; token: string }>('post', '/devices', payload);
}

export async function listConversations() {
  return request<Conversation[]>('/conversations');
}

export async function createConversation(payload: { hotelId: string; subject?: string }) {
  return mutate<Conversation>('post', '/conversations', payload);
}

export async function listMessages(conversationId: string) {
  return request<ChatMessage[]>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(
  conversationId: string,
  payload: { body: string },
) {
  return mutate<ChatMessage>('post', `/conversations/${conversationId}/messages`, payload);
}

export async function markConversationSeen(conversationId: string) {
  return mutate<ChatMessage[]>('post', `/conversations/${conversationId}/seen`);
}

export async function fetchAdminDashboard() {
  return request<AdminDashboardPayload>('/admin/dashboard');
}

export async function fetchAdminHotels(params: {
  limit?: number;
  page?: number;
  search?: string;
  status?: 'active' | 'archived' | 'all';
}) {
  return request<AdminListResponse<AdminHotel>>('/admin/hotels', params);
}

export async function fetchAdminHotel(hotelId: string) {
  return request<AdminHotel>(`/admin/hotels/${hotelId}`);
}

export async function createAdminHotel(payload: AdminHotelPayload) {
  return mutate<AdminHotel>('post', '/admin/hotels', payload);
}

export async function updateAdminHotel(hotelId: string, payload: AdminHotelPayload) {
  return mutate<AdminHotel>('patch', `/admin/hotels/${hotelId}`, payload);
}

export async function archiveAdminHotel(hotelId: string) {
  return mutate<{ id: string; status: 'archived' }>('delete', `/admin/hotels/${hotelId}`);
}

export async function fetchAdminUsers(params: {
  limit?: number;
  page?: number;
  role?: 'all' | 'user' | 'admin';
  search?: string;
  status?: 'all' | 'active' | 'suspended';
}) {
  return request<AdminListResponse<AdminUser>>('/admin/users', params);
}

export async function updateAdminUserRole(userId: string, payload: { role: 'user' | 'admin' }) {
  return mutate<AdminUser>('patch', `/admin/users/${userId}/role`, payload);
}

export async function updateAdminUserStatus(
  userId: string,
  payload: { reason?: string; status: 'active' | 'suspended' },
) {
  return mutate<AdminUser>('patch', `/admin/users/${userId}/status`, payload);
}

export async function fetchAdminConversations(params: {
  limit?: number;
  page?: number;
  search?: string;
  unreadOnly?: boolean;
}) {
  return request<AdminListResponse<AdminConversation>>('/admin/conversations', params);
}

export async function fetchAdminConversationMessages(conversationId: string) {
  return request<AdminConversationMessagesPayload>(
    `/admin/conversations/${conversationId}/messages`,
  );
}

export async function sendAdminMessage(
  conversationId: string,
  payload: { body: string },
) {
  return mutate<ChatMessage>('post', `/admin/conversations/${conversationId}/messages`, payload);
}

export async function markAdminConversationSeen(conversationId: string) {
  return mutate<ChatMessage[]>('post', `/admin/conversations/${conversationId}/seen`);
}

export async function fetchAdminNotifications() {
  return request<NotificationItem[]>('/admin/notifications');
}

export async function markAdminNotificationRead(notificationId: string) {
  return mutate<NotificationItem>('patch', `/admin/notifications/${notificationId}/read`);
}

export async function deleteAdminNotification(notificationId: string) {
  return mutate<{ id: string }>('delete', `/admin/notifications/${notificationId}`);
}

export { apiClient };
