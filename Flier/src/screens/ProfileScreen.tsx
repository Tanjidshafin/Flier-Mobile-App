import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { EmptyState } from '../components/app/EmptyState';
import { PrimaryAction } from '../components/app/PrimaryAction';
import { fetchBookings } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { BookingSummary } from '../types/booking';
import { MainTabParamList } from '../types/navigation';
import { formatCurrency, formatLongDate } from '../utils/format';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const session = useAuthStore(state => state.session);
  const signOut = useAuthStore(state => state.signOut);
  const [bookings, setBookings] = React.useState<BookingSummary[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      if (!session) {
        setBookings([]);
        return;
      }

      fetchBookings()
        .then(setBookings)
        .catch(() => setBookings([]));
    }, [session]),
  );

  if (!session) {
    return (
      <View className="flex-1 bg-brand-surfaceMuted px-5" style={{ paddingTop: insets.top + 22 }}>
        <Text style={typography.heading} className="text-brand-text">
          Profile
        </Text>
        <Text style={typography.body} className="mt-2 text-brand-muted">
          Sign in only when you need to confirm a booking or sync your saved stays.
        </Text>

        <View className="mt-8 rounded-[30px] bg-white p-6">
          <Text style={typography.title} className="text-brand-text">
            Booking requires authentication
          </Text>
          <Text style={typography.body} className="mt-3 text-brand-muted">
            Guests can browse everything, but reservations and booking history live behind your account.
          </Text>
          <PrimaryAction
            label="Sign In"
            onPress={() => navigation.getParent()?.navigate('Login', { source: 'profile' })}
            style={{ marginTop: 18 }}
          />
          <PrimaryAction
            label="Create Account"
            onPress={() => navigation.getParent()?.navigate('Register', { source: 'profile' })}
            style={{ marginTop: 12 }}
            variant="secondary"
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-surfaceMuted" style={{ paddingTop: insets.top + 18 }}>
      <View className="px-5">
        <Text style={typography.heading} className="text-brand-text">
          {session.user.fullName}
        </Text>
        <Text style={typography.body} className="mt-2 text-brand-muted">
          {session.user.email}
        </Text>
        <Text style={typography.body} className="mt-1 text-brand-muted">
          {session.user.phoneNumber || 'Phone will be collected at first booking'}
        </Text>
      </View>

      <FlatList
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 120 }}
        data={bookings}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message="Your confirmed reservations will appear here after you complete a booking."
            title="No bookings yet"
          />
        }
        ListHeaderComponent={
          <Text style={[typography.title, { color: colors.textPrimary }]}>
            Booking history
          </Text>
        }
        renderItem={({ item }) => (
          <View className="rounded-[28px] bg-white p-4">
            <Text style={typography.title} className="text-brand-text">
              {item.hotel.name}
            </Text>
            <View className="mt-1 flex-row items-center">
              <AppIcon color={colors.textMuted} name="map-marker-outline" size={16} />
              <Text style={[typography.body, { marginLeft: 6 }]} className="text-brand-muted">
                {item.hotel.locationLabel}
              </Text>
            </View>
            <View className="mt-3 flex-row items-center">
              <AppIcon color={colors.primary} name="calendar-range" size={16} />
              <Text style={[typography.body, { marginLeft: 8 }]} className="text-brand-text">
                {formatLongDate(item.checkIn)} - {formatLongDate(item.checkOut)}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center">
              <AppIcon color={colors.textSecondary} name="shield-check-outline" size={16} />
              <Text style={[typography.body, { marginLeft: 8 }]} className="text-brand-muted">
                {item.confirmationCode}
              </Text>
            </View>
            <Text style={[typography.title, { marginTop: 12 }]} className="text-brand-text">
              {formatCurrency(item.pricing.totalAmount, item.pricing.currency)}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      <View className="px-5 pb-6">
        <PrimaryAction
          label="Sign Out"
          onPress={async () => {
            await signOut();
          }}
          variant="secondary"
        />
      </View>
    </View>
  );
}
