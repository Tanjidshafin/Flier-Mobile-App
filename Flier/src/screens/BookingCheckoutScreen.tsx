import React from 'react';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStripe } from '@stripe/stripe-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { EmptyState } from '../components/app/EmptyState';
import { PrimaryAction } from '../components/app/PrimaryAction';
import { ScreenHeader } from '../components/app/ScreenHeader';
import { AuthTextField } from '../components/auth/AuthTextField';
import {
  useCompleteBookingMutation,
  useHoldBookingMutation,
} from '../features/bookings/hooks';
import { useHotelDetailsQuery } from '../features/hotels/hooks';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useUIStore } from '../store/uiStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types/navigation';
import { createIdempotencyKey } from '../utils/idempotency';
import { formatCurrency, formatLongDate, getNightCount } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingCheckout'>;

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon?: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        {icon ? <AppIcon color={colors.primary} name={icon} size={17} /> : null}
        <Text style={[typography.body, { marginLeft: icon ? 8 : 0 }]} className="text-brand-muted">
          {label}
        </Text>
      </View>
      <Text style={[typography.body, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

export function BookingCheckoutScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const session = useAuthStore(state => state.session);
  const draft = useBookingStore(state => state.draft);
  const updateDraft = useBookingStore(state => state.updateDraft);
  const clearDraft = useBookingStore(state => state.clearDraft);
  const setLatestBooking = useBookingStore(state => state.setLatestBooking);
  const showToast = useUIStore(state => state.showToast);
  const [phone, setPhone] = React.useState(draft?.contactPhone || session?.user.phoneNumber || '');
  const [specialRequests, setSpecialRequests] = React.useState(draft?.specialRequests || '');
  const [error, setError] = React.useState('');
  const holdBookingMutation = useHoldBookingMutation();
  const completeBookingMutation = useCompleteBookingMutation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { data: details } = useHotelDetailsQuery(draft?.hotelSlug || '', {
    checkIn: draft?.checkIn,
    checkOut: draft?.checkOut,
  });

  if (!draft || !session) {
    return (
      <View className="flex-1 bg-brand-surfaceMuted px-5 pt-10">
        <ScreenHeader onBackPress={() => navigation.goBack()} title="Booking checkout" />
        <EmptyState
          message="Choose a hotel first, then we’ll bring you back here with your stay details."
          title="No booking draft yet"
        />
      </View>
    );
  }

  const nights = getNightCount(draft.checkIn, draft.checkOut);
  const roomRate = details?.roomTypes.find(item => item.code === draft.roomTypeId)?.nightlyRate || draft.nightlyRate;
  const pricing = details?.pricing ?? {
    cleaningFee: 0,
    currency: draft.currency,
    nightlyRate: roomRate,
    serviceFee: 0,
    taxRate: 0.1,
  };
  const baseAmount = roomRate * nights * draft.roomCount;
  const taxAmount = Math.round(baseAmount * pricing.taxRate);
  const totalAmount = baseAmount + pricing.cleaningFee + pricing.serviceFee + taxAmount;
  const isSubmitting =
    holdBookingMutation.isPending || completeBookingMutation.isPending;

  return (
    <View className="flex-1 bg-brand-surfaceMuted">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 100,
          paddingHorizontal: 20,
          paddingTop: insets.top + 16,
        }}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader onBackPress={() => navigation.goBack()} title="Booking checkout" />
        <Text style={typography.heading} className="text-brand-text">
          Confirm your stay
        </Text>
        <Text style={typography.body} className="mt-2 text-brand-muted">
          Review your room, then pay securely to lock in the booking.
        </Text>

        <View className="mt-6 rounded-[28px] bg-white p-5">
          <Image
            source={{ uri: draft.hotelImage }}
            resizeMode="cover"
            style={{ borderRadius: 22, height: 180, width: '100%' }}
          />
          <Text style={[typography.title, { marginTop: 14 }]} className="text-brand-text">
            {draft.hotelName}
          </Text>
          <Text style={typography.body} className="mt-2 text-brand-muted">
            {draft.locationLabel}
          </Text>
          <View className="mt-4 gap-2">
            <SummaryRow
              icon="calendar-range"
              label="Dates"
              value={`${formatLongDate(draft.checkIn)} - ${formatLongDate(draft.checkOut)}`}
            />
            <SummaryRow
              icon="account-group-outline"
              label="Guests"
              value={`${draft.adults + draft.children} guests`}
            />
            <SummaryRow icon="bed-outline" label="Room type" value={draft.roomTypeName} />
            <SummaryRow icon="bed-outline" label="Rooms" value={`${draft.roomCount}`} />
            <SummaryRow icon="weather-night" label="Nights" value={`${nights}`} />
          </View>
        </View>

        <View className="mt-5 rounded-[28px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Contact details
          </Text>
          <Text style={typography.body} className="mt-2 text-brand-muted">
            We use your phone for booking confirmation and check-in support.
          </Text>
          <View className="mt-4">
            <AuthTextField
              keyboardType="phone-pad"
              label="Phone number"
              leftAccessory={<AppIcon color={colors.textMuted} name="phone-outline" size={18} />}
              placeholder="+8801..."
              value={phone}
              onChangeText={value => {
                setPhone(value);
                updateDraft({ contactPhone: value });
              }}
            />
          </View>
        </View>

        <View className="mt-5 rounded-[28px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Special requests
          </Text>
          <TextInput
            multiline
            numberOfLines={4}
            onChangeText={value => {
              setSpecialRequests(value);
              updateDraft({ specialRequests: value });
            }}
            placeholder="Late arrival, high floor, quiet room..."
            placeholderTextColor={colors.textMuted}
            style={[
              typography.body,
              {
                backgroundColor: colors.surfaceMuted,
                borderRadius: 20,
                color: colors.textPrimary,
                marginTop: 14,
                minHeight: 120,
                padding: 16,
                textAlignVertical: 'top',
              },
            ]}
            value={specialRequests}
          />
        </View>

        <View className="mt-5 rounded-[28px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Price summary
          </Text>
          <View className="mt-4 gap-3">
            <SummaryRow
              label={`${formatCurrency(roomRate, pricing.currency)} x ${nights} nights x ${draft.roomCount} room`}
              value={formatCurrency(baseAmount, pricing.currency)}
            />
            <SummaryRow
              label="Cleaning fee"
              value={formatCurrency(pricing.cleaningFee, pricing.currency)}
            />
            <SummaryRow
              label="Service fee"
              value={formatCurrency(pricing.serviceFee, pricing.currency)}
            />
            <SummaryRow label="Taxes" value={formatCurrency(taxAmount, pricing.currency)} />
            <View className="mt-2 h-px bg-brand-border" />
            <SummaryRow label="Total" value={formatCurrency(totalAmount, pricing.currency)} />
          </View>
        </View>

        {error ? (
          <Text
            style={[typography.body, { color: colors.error, marginTop: 16 }]}
            className="text-center">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-brand-border bg-white px-5"
        style={{ paddingBottom: Math.max(insets.bottom, 18), paddingTop: 16 }}>
        <PrimaryAction
          disabled={isSubmitting || !phone.trim()}
          label={isSubmitting ? 'Processing booking...' : 'Pay and confirm'}
          onPress={async () => {
            const holdIdempotencyKey = createIdempotencyKey('hold');
            const completeIdempotencyKey = createIdempotencyKey('complete');

            try {
              setError('');
              const holdResponse = await holdBookingMutation.mutateAsync({
                adults: draft.adults,
                checkIn: draft.checkIn,
                checkOut: draft.checkOut,
                children: draft.children,
                contactPhone: phone,
                hotelId: draft.hotelId,
                idempotencyKey: holdIdempotencyKey,
                roomCount: draft.roomCount,
                roomTypeId: draft.roomTypeId,
                specialRequests,
              });

              if (
                holdResponse.paymentSession.provider === 'stripe' &&
                holdResponse.paymentSession.paymentIntentClientSecret &&
                holdResponse.paymentSession.customerId &&
                holdResponse.paymentSession.ephemeralKeySecret
              ) {
                const initResult = await initPaymentSheet({
                  customerEphemeralKeySecret:
                    holdResponse.paymentSession.ephemeralKeySecret,
                  customerId: holdResponse.paymentSession.customerId,
                  merchantDisplayName: holdResponse.paymentSession.merchantDisplayName,
                  paymentIntentClientSecret:
                    holdResponse.paymentSession.paymentIntentClientSecret,
                });

                if (initResult.error) {
                  throw new Error(initResult.error.message);
                }

                const paymentResult = await presentPaymentSheet();

                if (paymentResult.error) {
                  throw new Error(paymentResult.error.message);
                }
              }

              const booking = await completeBookingMutation.mutateAsync({
                bookingId: holdResponse.booking.id,
                payload: {
                  idempotencyKey: completeIdempotencyKey,
                  paymentIntentId: holdResponse.paymentSession.paymentIntentId,
                },
              });

              useAuthStore.setState(state => ({
                session: state.session
                  ? {
                      ...state.session,
                      user: {
                        ...state.session.user,
                        phoneNumber: phone,
                      },
                    }
                  : state.session,
              }));

              setLatestBooking(booking);
              clearDraft();
              showToast({
                message: 'Your reservation is confirmed.',
                title: 'Booking complete',
                tone: 'success',
              });
              navigation.replace('BookingSuccess', { bookingId: booking.id });
            } catch (caughtError) {
              const nextError =
                caughtError instanceof Error
                  ? caughtError.message
                  : 'Unable to confirm this booking right now.';
              setError(nextError);
            }
          }}
        />
      </View>
    </View>
  );
}
