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
import { fetchHotelDetails } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useWishlistStore } from '../store/wishlistStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types/navigation';
import { HotelDetails } from '../types/hotel';
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

export function HotelDetailsScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const session = useAuthStore(state => state.session);
  const isSaved = useWishlistStore(state => state.isSaved);
  const toggleSaved = useWishlistStore(state => state.toggleSaved);
  const setDraftFromHotel = useBookingStore(state => state.setDraftFromHotel);
  const scrollY = useSharedValue(0);
  const [details, setDetails] = React.useState<HotelDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    fetchHotelDetails(route.params?.hotelSlug || '')
      .then(setDetails)
      .catch(() => setError('Unable to load hotel details.'))
      .finally(() => setLoading(false));
  }, [route.params?.hotelSlug]);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [180, 260], [0, 1], Extrapolation.CLAMP),
  }));

  if (loading) {
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
          message={error || 'Try opening this hotel again from search results.'}
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
        contentContainerStyle={{ paddingBottom: 140 }}
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
                onPress={() => toggleSaved(details)}>
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

          <Text style={[typography.title, { marginTop: 24 }]} className="text-brand-text">
            Description
          </Text>
          <Text style={typography.body} className="mt-3 text-brand-muted">
            {details.description}
          </Text>

          <Text style={[typography.title, { marginTop: 24 }]} className="text-brand-text">
            Amenities
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            {details.amenities.map(amenity => (
              <View
                className="rounded-full bg-brand-surfaceMuted px-4 py-2"
                key={amenity}>
                <Text style={[typography.body, { fontSize: 13 }]}>{amenity}</Text>
              </View>
            ))}
          </View>

          <Text style={[typography.title, { marginTop: 24 }]} className="text-brand-text">
            Stay policies
          </Text>
          <View className="mt-4 gap-3 rounded-[24px] bg-brand-surfaceMuted p-4">
            <PolicyRow icon="clock-start" label={`Check-in from ${details.policies.checkInFrom}`} />
            <PolicyRow icon="clock-end" label={`Check-out until ${details.policies.checkOutUntil}`} />
            <PolicyRow icon="calendar-remove-outline" label={details.policies.cancellation} />
          </View>
        </View>
      </AnimatedScrollView>

      <View
        className="absolute inset-x-0 bottom-0 flex-row items-center justify-between border-t border-brand-border bg-white px-5"
        style={{ paddingBottom: Math.max(insets.bottom, 18), paddingTop: 16 }}>
        <View>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Start from
          </Text>
          <Text style={typography.title} className="text-brand-text">
            {formatCurrency(details.price.amount, details.price.currency)}
          </Text>
        </View>
        <View style={{ width: 170 }}>
          <PrimaryAction
            label="Book Now"
            onPress={() => {
              setDraftFromHotel(details);

              if (!session) {
                navigation.navigate('Login', { source: 'booking' });
                return;
              }

              navigation.navigate('BookingCheckout');
            }}
          />
        </View>
      </View>
    </View>
  );
}
