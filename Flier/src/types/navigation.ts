import { NavigatorScreenParams } from '@react-navigation/native';

import { BookingDraft } from './booking';
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
  Login: { source?: 'booking' | 'profile' } | undefined;
  Register: { source?: 'booking' | 'profile' } | undefined;
  HotelDetails: { hotelSlug: string; hotel?: HotelSummary } | undefined;
  BookingCheckout: { draft?: BookingDraft } | undefined;
  BookingSuccess: { bookingId: string } | undefined;
};
