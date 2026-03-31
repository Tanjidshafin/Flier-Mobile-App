import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { EmptyState } from '../components/app/EmptyState';
import { PrimaryAction } from '../components/app/PrimaryAction';
import { ScreenHeader } from '../components/app/ScreenHeader';
import { useBookingQuery } from '../features/bookings/hooks';
import { useBookingStore } from '../store/bookingStore';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types/navigation';
import { formatCurrency, formatLongDate } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingSuccess'>;

function BookingInfoRow({
  icon,
  value,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  value: string;
}) {
  return (
    <View className="flex-row items-center">
      <AppIcon name={icon} size={18} color="#355DFF" />
      <Text style={[typography.body, { marginLeft: 10 }]} className="text-brand-text">
        {value}
      </Text>
    </View>
  );
}

export function BookingSuccessScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const bookingId = route.params?.bookingId ?? '';
  const latestBooking = useBookingStore(state => state.latestBooking);
  const query = useBookingQuery(bookingId);
  const booking = latestBooking?.id === bookingId ? latestBooking : query.data;

  if (!booking) {
    return (
      <View className="flex-1 bg-brand-surfaceMuted px-5 pt-10">
        <ScreenHeader onBackPress={() => navigation.goBack()} title="Reservation" />
        <EmptyState
          message="We couldn't load your confirmed reservation summary."
          title="Booking summary unavailable"
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-surfaceMuted"
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 24) + 20,
        paddingHorizontal: 20,
        paddingTop: insets.top + 22,
      }}
      showsVerticalScrollIndicator={false}>
      <ScreenHeader onBackPress={() => navigation.goBack()} title="Reservation" />
      <View className="rounded-[32px] bg-white p-5">
        <Text style={typography.heading} className="text-brand-text">
          Booking confirmed
        </Text>
        <Text style={typography.body} className="mt-3 text-brand-muted">
          Your reservation is locked in. Keep this confirmation code handy at check-in.
        </Text>

        <View className="mt-5 rounded-[24px] bg-brand-surfaceMuted px-4 py-5">
          <Text style={typography.caption} className="text-brand-muted">
            Confirmation code
          </Text>
          <Text style={[typography.heading, { fontSize: 24 }]} className="mt-2 text-brand-text">
            {booking.confirmationCode}
          </Text>
        </View>

        <Image
          source={{ uri: booking.hotel.coverImage }}
          resizeMode="cover"
          style={{ borderRadius: 24, height: 220, marginTop: 20, width: '100%' }}
        />

        <Text style={[typography.title, { marginTop: 18 }]} className="text-brand-text">
          {booking.hotel.name}
        </Text>
        <View className="mt-2 flex-row items-center">
          <AppIcon color="#8C93A3" name="map-marker-outline" size={18} />
          <Text style={[typography.body, { marginLeft: 6 }]} className="text-brand-muted">
            {booking.hotel.locationLabel}
          </Text>
        </View>

        <View className="mt-5 gap-3">
          <BookingInfoRow
            icon="calendar-range"
            value={`${formatLongDate(booking.checkIn)} - ${formatLongDate(booking.checkOut)}`}
          />
          <BookingInfoRow
            icon="account-group-outline"
            value={`${booking.guests.adults + booking.guests.children} guests, ${booking.roomCount} room`}
          />
          <BookingInfoRow icon="bed-outline" value={booking.roomType.name} />
          <BookingInfoRow icon="phone-outline" value={booking.contactPhone} />
          <Text style={[typography.title, { marginTop: 8 }]} className="text-brand-text">
            {formatCurrency(booking.pricing.totalAmount, booking.pricing.currency)}
          </Text>
        </View>
      </View>

      <PrimaryAction
        label="View Profile"
        onPress={() => navigation.replace('MainTabs', { screen: 'Profile' })}
        style={{ marginTop: 22 }}
      />
      <PrimaryAction
        label="Explore More Hotels"
        onPress={() => navigation.replace('MainTabs', { screen: 'Search' })}
        style={{ marginTop: 12 }}
        variant="secondary"
      />
    </ScrollView>
  );
}
