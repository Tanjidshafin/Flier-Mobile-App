import { Platform } from 'react-native';

declare const process:
  | {
      env: Record<string, string | undefined>;
    }
  | undefined;

const DEFAULT_ANDROID_API_URL = 'http://10.0.2.2:5000/api';
const DEFAULT_IOS_API_URL = 'http://localhost:5000/api';

export const API_BASE_URL =
  process?.env.FLIER_API_BASE_URL ||
  process?.env.EXPO_PUBLIC_FLIER_API_BASE_URL ||
  (Platform.OS === 'android' ? DEFAULT_ANDROID_API_URL : DEFAULT_IOS_API_URL);

export const STORAGE_KEYS = {
  authSession: 'flier.auth.session.v2',
  bookingDraft: 'flier.booking.draft.v1',
  onboardingCompleted: 'flier.onboarding.completed.v1',
  guestWishlist: 'flier.wishlist.guest.v1',
  searchFilters: 'flier.search.filters.v1',
} as const;
