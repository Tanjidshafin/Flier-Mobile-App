import { Platform } from 'react-native';
import Config from 'react-native-config';

const DEFAULT_ANDROID_API_URL = 'http://10.0.2.2:5000/api';
const DEFAULT_IOS_API_URL = 'http://localhost:5000/api';
const FALLBACK_API_URL =
  Platform.OS === 'android' ? DEFAULT_ANDROID_API_URL : DEFAULT_IOS_API_URL;

export const API_BASE_URL = Config.FLIER_API_BASE_URL || FALLBACK_API_URL;
export const SOCKET_BASE_URL =
  Config.FLIER_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, '');
export const STRIPE_PUBLISHABLE_KEY = Config.FLIER_STRIPE_PUBLISHABLE_KEY || '';

if (__DEV__) {
  console.info(`[api] Using base URL: ${API_BASE_URL}`);
}

export const STORAGE_KEYS = {
  authSession: 'flier.auth.session.v2',
  bookingDraft: 'flier.booking.draft.v1',
  onboardingCompleted: 'flier.onboarding.completed.v1',
  guestWishlist: 'flier.wishlist.guest.v1',
  searchFilters: 'flier.search.filters.v1',
} as const;
