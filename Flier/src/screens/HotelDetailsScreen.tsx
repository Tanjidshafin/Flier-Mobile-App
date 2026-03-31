import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { EmptyState } from '../components/app/EmptyState';
import { LoadingCard } from '../components/app/LoadingCard';
import { PrimaryAction } from '../components/app/PrimaryAction';
import { useHotelDetailsQuery } from '../features/hotels/hooks';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useSearchStore } from '../store/searchStore';
import { useUIStore } from '../store/uiStore';
import { useWishlistStore } from '../store/wishlistStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types/navigation';
import { RoomType } from '../types/hotel';
import { formatCurrency } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'HotelDetails'>;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function DetailPill({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
}) {
  return (
    <View className="flex-row items-center rounded-full bg-brand-surfaceMuted px-4 py-2">
      <AppIcon color={colors.textSecondary} name={icon} size={16} />
      <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 8 }]}>{label}</Text>
    </View>
  );
}

function PolicyRow({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
}) {
  return (
    <View className="flex-row items-center">
      <AppIcon color={colors.primary} name={icon} size={18} />
      <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 10 }]}>{label}</Text>
    </View>
  );
}

function RoomTypeCard({
  onPress,
  roomType,
  selected,
}: {
  onPress: () => void;
  roomType: RoomType;
  selected: boolean;
}) {
  return (
    <Pressable
      className={`rounded-[24px] border p-4 ${selected ? 'border-brand-primary bg-brand-surfaceElevated' : 'border-brand-border bg-white'}`}
      onPress={onPress}>
      <Image
        source={{ uri: roomType.image || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80' }}
        resizeMode="cover"
        style={{ borderRadius: 18, height: 140, width: '100%' }}
      />
      <View className="mt-4 flex-row items-center justify-between">
        <Text style={typography.title} className="flex-1 text-brand-text">
          {roomType.name}
        </Text>
        {selected ? (
          <Text style={[typography.caption, { color: colors.primary }]}>Selected</Text>
        ) : null}
      </View>
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: 6 }]}>
        {roomType.description}
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-3">
        <DetailPill icon="account-group-outline" label={`${roomType.maxGuests} guests`} />
        <DetailPill icon="bed-queen-outline" label={`${roomType.beds} beds`} />
        <DetailPill icon="bed-outline" label={`${roomType.availableUnits} left`} />
      </View>
      <Text style={[typography.title, { marginTop: 12 }]} className="text-brand-text">
        {formatCurrency(roomType.nightlyRate, 'USD')}
      </Text>
    </Pressable>
  );
}

export function HotelDetailsScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const session = useAuthStore(state => state.session);
  const isSaved = useWishlistStore(state => state.isSaved);
  const toggleSaved = useWishlistStore(state => state.toggleSaved);
  const setDraftFromHotel = useBookingStore(state => state.setDraftFromHotel);
  const updateDraft = useBookingStore(state => state.updateDraft);
  const filters = useSearchStore(state => state.filters);
  const showToast = useUIStore(state => state.showToast);
  const scrollY = useSharedValue(0);
  const [page, setPage] = React.useState(0);
  const { data: details, error, isLoading } = useHotelDetailsQuery(route.params?.hotelSlug || '', {
    checkIn: filters.checkIn,
    checkOut: filters.checkOut,
  });
  const [selectedRoomTypeId, setSelectedRoomTypeId] = React.useState<string>('');

  React.useEffect(() => {
    if (details?.roomTypes?.length && !selectedRoomTypeId) {
      setSelectedRoomTypeId(details.roomTypes[0].code);
    }
  }, [details?.roomTypes, selectedRoomTypeId]);

  const selectedRoomType =
    details?.roomTypes.find(item => item.code === selectedRoomTypeId) || details?.roomTypes[0];

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [180, 260], [0, 1], Extrapolation.CLAMP),
  }));

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-surfaceMuted px-5 pt-10">
        <LoadingCard />
      </View>
    );
  }

  if (!details) {
    return (
      <View className="flex-1 bg-brand-surfaceMuted px-5 pt-10">
        <EmptyState
          message={error instanceof Error ? error.message : 'Try opening this hotel again from search results.'}
          title="Hotel details unavailable"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-surfaceMuted">
      <Animated.View
        pointerEvents="none"
        style={[
          {
            backgroundColor: colors.surface,
            height: insets.top + 66,
            left: 0,
            paddingHorizontal: 20,
            paddingTop: insets.top + 16,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 20,
          },
          headerStyle,
        ]}>
        <Text numberOfLines={1} style={typography.title} className="text-center text-brand-text">
          {details.name}
        </Text>
      </Animated.View>

      <AnimatedScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <View>
          <ScrollView
            horizontal
            onMomentumScrollEnd={event => {
              const nextPage = Math.round(event.nativeEvent.contentOffset.x / width);
              setPage(nextPage);
            }}
            pagingEnabled
            showsHorizontalScrollIndicator={false}>
            {details.images.map(image => (
              <Image
                key={image}
                source={{ uri: image }}
                resizeMode="cover"
                style={{ height: 360, width }}
              />
            ))}
          </ScrollView>

          <View
            className="absolute inset-x-0 top-0 flex-row items-center justify-between px-5"
            style={{ paddingTop: insets.top + 10 }}>
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full bg-white/85"
              onPress={() => navigation.goBack()}>
              <AppIcon color={colors.textPrimary} name="arrow-left" size={22} />
            </Pressable>
            <View className="flex-row gap-3">
              <Pressable
                className="h-11 w-11 items-center justify-center rounded-full bg-white/85"
                onPress={() => {
                  void toggleSaved(details);
                  showToast({
                    message: isSaved(details.id)
                      ? 'Removed from your wishlist.'
                      : 'Saved to your wishlist.',
                    title: 'Wishlist',
                    tone: 'success',
                  });
                }}>
                <AppIcon
                  color={isSaved(details.id) ? '#F43F5E' : colors.textPrimary}
                  name={isSaved(details.id) ? 'heart' : 'heart-outline'}
                  size={22}
                />
              </Pressable>
            </View>
          </View>

          <View className="absolute bottom-5 right-5 rounded-full bg-black/55 px-3 py-1.5">
            <Text style={[typography.caption, { color: '#FFFFFF' }]}>
              {page + 1}/{details.images.length}
            </Text>
          </View>
        </View>

        <View className="rounded-t-[32px] bg-brand-surface px-5 pb-12 pt-6">
          <Text style={typography.heading} className="text-brand-text">
            {details.name}
          </Text>
          <View className="mt-2 flex-row items-center">
            <AppIcon color={colors.textMuted} name="map-marker-outline" size={18} />
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 6 }]}>
              {details.locationLabel}
            </Text>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-4">
            <DetailPill icon="bed-queen-outline" label={`${details.rooms} rooms`} />
            <DetailPill icon="shower" label={`${details.baths} baths`} />
            <DetailPill icon="ruler-square" label={`${details.squareMeters} m²`} />
            <DetailPill icon="star" label={`${details.rating.toFixed(1)} rating`} />
          </View>

          <View className="mt-6 rounded-[24px] bg-brand-surfaceMuted p-4">
            <Text style={typography.title} className="text-brand-text">
              Stay overview
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
              {details.description}
            </Text>
          </View>

          <Text style={[typography.title, { marginTop: 24 }]} className="text-brand-text">
            Choose your room
          </Text>
          <View className="mt-4 gap-4">
            {details.roomTypes.map(roomType => (
              <RoomTypeCard
                key={roomType.code}
                onPress={() => setSelectedRoomTypeId(roomType.code)}
                roomType={roomType}
                selected={selectedRoomType?.code === roomType.code}
              />
            ))}
          </View>

          <Text style={[typography.title, { marginTop: 24 }]} className="text-brand-text">
            Amenities
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            {details.amenities.map(amenity => (
              <View className="rounded-full bg-brand-surfaceMuted px-4 py-2" key={amenity}>
                <Text style={[typography.body, { fontSize: 13 }]}>{amenity}</Text>
              </View>
            ))}
          </View>

          <Text style={[typography.title, { marginTop: 24 }]} className="text-brand-text">
            Guest reviews
          </Text>
          <View className="mt-4 rounded-[24px] bg-brand-surfaceMuted p-4">
            <Text style={typography.title} className="text-brand-text">
              {details.reviewsSummary.average.toFixed(1)} / 5
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
              Based on {details.reviewsSummary.total} verified reviews
            </Text>
            <View className="mt-4 gap-3">
              {details.recentReviews.map(review => (
                <View className="rounded-[18px] bg-white p-4" key={review.id}>
                  <View className="flex-row items-center justify-between">
                    <Text style={typography.title} className="text-[16px] text-brand-text">
                      {review.authorName}
                    </Text>
                    <Text style={[typography.caption, { color: colors.primary }]}>
                      {review.rating.toFixed(1)}
                    </Text>
                  </View>
                  <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={[typography.title, { marginTop: 24 }]} className="text-brand-text">
            Stay policies
          </Text>
          <View className="mt-4 gap-3 rounded-[24px] bg-brand-surfaceMuted p-4">
            <PolicyRow icon="clock-start" label={`Check-in from ${details.policies.checkInFrom}`} />
            <PolicyRow icon="clock-end" label={`Check-out until ${details.policies.checkOutUntil}`} />
            <PolicyRow
              icon="calendar-remove-outline"
              label={`${details.policies.cancellation} Cancel up to ${details.cancellationWindowHours}h before check-in.`}
            />
          </View>
        </View>
      </AnimatedScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-brand-border bg-white px-5"
        style={{ paddingBottom: Math.max(insets.bottom, 18), paddingTop: 16 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Starting at</Text>
            <Text style={typography.title} className="text-brand-text">
              {formatCurrency(
                selectedRoomType?.nightlyRate || details.price.amount,
                details.price.currency,
              )}
            </Text>
          </View>
          <View className="w-[170px]">
            <PrimaryAction
              label="Chat Support"
              onPress={() =>
                navigation.navigate('Chat', {
                  hotelId: details.id,
                  hotelName: details.name,
                  hotelSlug: details.slug,
                })
              }
              variant="secondary"
            />
          </View>
        </View>
        <PrimaryAction
          label="Book this room"
          onPress={() => {
            setDraftFromHotel(details);
            updateDraft({
              currency: details.pricing.currency,
              nightlyRate: selectedRoomType?.nightlyRate || details.price.amount,
              roomCount: filters.rooms,
              roomTypeId: selectedRoomType?.code || 'signature-suite',
              roomTypeImage: selectedRoomType?.image || details.image,
              roomTypeName: selectedRoomType?.name || 'Signature Room',
            });

            if (!session) {
              navigation.navigate('Login', { source: 'booking' });
              return;
            }

            navigation.navigate('BookingCheckout');
          }}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
}
