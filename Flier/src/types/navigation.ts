import { NavigatorScreenParams } from '@react-navigation/native';

import { AdminConversation } from './admin';
import { BookingDraft } from './booking';
import { Conversation } from './chat';
import { HotelSummary } from './hotel';

export type MainTabParamList = {
  Home: undefined;
  Search:
    | {
        mode?: 'browse' | 'pick-destination';
        source?: 'home';
      }
    | undefined;
  Wishlist: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  AdminPanel: NavigatorScreenParams<AdminStackParamList> | undefined;
  Login: { source?: 'booking' | 'profile' } | undefined;
  Register: { source?: 'booking' | 'profile' } | undefined;
  HotelDetails: { hotelSlug: string; hotel?: HotelSummary } | undefined;
  BookingCheckout: { draft?: BookingDraft } | undefined;
  BookingSuccess: { bookingId: string } | undefined;
  Notifications: undefined;
  Chat:
    | {
        conversation?: Conversation;
        conversationId?: string;
        hotelId?: string;
        hotelName?: string;
        hotelSlug?: string;
      }
    | undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminHotels: undefined;
  AdminHotelEditor: { hotelId?: string } | undefined;
  AdminUsers: undefined;
  AdminChatInbox: undefined;
  AdminChatConversation:
    | {
        conversation?: AdminConversation;
        conversationId?: string;
      }
    | undefined;
  AdminNotifications: undefined;
};
