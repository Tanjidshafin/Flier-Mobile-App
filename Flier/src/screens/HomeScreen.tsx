import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { DateRangePickerSheet } from '../components/app/DateRangePickerSheet';
import { DestinationCard } from '../components/app/DestinationCard';
import { EmptyState } from '../components/app/EmptyState';
import { GuestPickerSheet } from '../components/app/GuestPickerSheet';
import { HotelCard } from '../components/app/HotelCard';
import { LoadingCard } from '../components/app/LoadingCard';
import { SectionHeader } from '../components/app/SectionHeader';
import { fetchHomeData } from '../services/api';
import { useSearchStore } from '../store/searchStore';
import { useWishlistStore } from '../store/wishlistStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainTabParamList } from '../types/navigation';
import { HomePayload } from '../types/hotel';
import { formatLongDate } from '../utils/format';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const filters = useSearchStore(state => state.filters);
  const destinationLabel = useSearchStore(state => state.destinationLabel);
  const setDateRange = useSearchStore(state => state.setDateRange);
  const setGuests = useSearchStore(state => state.setGuests);
  const isSaved = useWishlistStore(state => state.isSaved);
  const toggleSaved = useWishlistStore(state => state.toggleSaved);
  const scrollY = useSharedValue(0);
  const dateSheetRef = React.useRef<BottomSheetModal>(null);
  const guestSheetRef = React.useRef<BottomSheetModal>(null);
  const [payload, setPayload] = React.useState<HomePayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const hasDestination = Boolean(destinationLabel.trim() && filters.destinationId);

  const openSearch = React.useCallback(
    (mode: 'browse' | 'pick-destination' = 'browse') => {
      navigation.navigate('Search', {
        mode,
        source: 'home',
      });
    },
    [navigation],
  );

  const loadHome = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchHomeData();
      setPayload(response);
    } catch {
      setError('Unable to load featured stays right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadHome();
  }, [loadHome]);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, 120], [0, -26], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(scrollY.value, [0, 160], [1, 0.97], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <View className="flex-1 bg-brand-surfaceMuted">
      <AnimatedScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[
            {
              backgroundColor: colors.surface,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              marginBottom: 20,
              paddingBottom: 24,
              paddingHorizontal: 20,
              paddingTop: insets.top + 18,
            },
            heroStyle,
          ]}>
          <Text style={typography.body} className="text-brand-muted">
            {hasDestination ? 'Find your place in' : 'Start your next stay with'}
          </Text>
          <View className="mt-2 flex-row items-center justify-between">
            <Pressable
              className="flex-1 flex-row items-center"
              onPress={() => openSearch('pick-destination')}>
              <AppIcon color={colors.primary} name="map-marker" size={22} />
              <View className="ml-2 flex-1">
                <Text style={[typography.heading, { fontSize: 26 }]} className="text-brand-text">
                  {hasDestination ? destinationLabel : 'Choose your destination'}
                </Text>
                {!hasDestination ? (
                  <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
                    Pick a city or area before browsing stays.
                  </Text>
                ) : null}
              </View>
              <AppIcon color={colors.textSecondary} name="chevron-right" size={20} />
            </Pressable>
            <AppIcon color={colors.textPrimary} name="bell-outline" size={22} />
          </View>

          <Pressable
            className="mt-6 flex-row items-center rounded-[22px] border border-brand-border bg-brand-surfaceMuted px-4 py-4"
            onPress={() => openSearch(hasDestination ? 'browse' : 'pick-destination')}>
            <AppIcon color={colors.textMuted} name="magnify" size={22} />
            <Text style={typography.body} className="ml-3 text-brand-muted">
              {hasDestination ? 'Search hotels, areas, or stays' : 'Choose where you want to stay'}
            </Text>
          </Pressable>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              className="flex-1 rounded-[22px] bg-brand-surfaceMuted px-4 py-4"
              onPress={() => dateSheetRef.current?.present()}>
              <Text style={typography.caption} className="text-brand-muted">
                Dates
              </Text>
              <Text style={[typography.body, { color: colors.textPrimary, marginTop: 6 }]}>
                {formatLongDate(filters.checkIn)} - {formatLongDate(filters.checkOut)}
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-[22px] bg-brand-surfaceMuted px-4 py-4"
              onPress={() => guestSheetRef.current?.present()}>
              <Text style={typography.caption} className="text-brand-muted">
                Guests
              </Text>
              <Text style={[typography.body, { color: colors.textPrimary, marginTop: 6 }]}>
                {filters.adults + filters.children} guests, {filters.rooms} room
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <View className="px-5">
          <SectionHeader actionLabel="See all" onPressAction={() => openSearch('browse')} title="Featured hotels" />
          {loading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="w-[280px]"><LoadingCard /></View>
              <View className="ml-4 w-[280px]"><LoadingCard /></View>
            </ScrollView>
          ) : payload?.featuredHotels.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {payload.featuredHotels.map((hotel, index) => (
                <View
                  className={`${index === 0 ? '' : 'ml-4'} w-[300px]`}
                  key={hotel.id}>
                  <HotelCard
                    compact
                    hotel={hotel}
                    onPress={() =>
                      navigation.getParent()?.navigate('HotelDetails', {
                        hotel: hotel,
                        hotelSlug: hotel.slug,
                      })
                    }
                    onToggleSaved={() => toggleSaved(hotel)}
                    saved={isSaved(hotel.id)}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <EmptyState
              message={error || 'Seed the backend and featured hotels will show up here.'}
              title="No featured stays yet"
            />
          )}

          <View className="mt-8">
            <SectionHeader title="Featured destinations" />
            {payload?.featuredDestinations.length ? (
              <View className="gap-4">
                {payload.featuredDestinations.map(destination => (
                  <DestinationCard
                    destination={destination}
                    key={destination.destinationId}
                    onPress={() => {
                      useSearchStore
                        .getState()
                        .setDestination(
                          destination.destinationId,
                          destination.locationLabel,
                          destination.locationLabel,
                        );
                      openSearch('browse');
                    }}
                  />
                ))}
              </View>
            ) : (
              <View className="rounded-[28px] bg-white p-4">
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' }}
                  resizeMode="cover"
                  style={{ borderRadius: 20, height: 180, width: '100%' }}
                />
                <Text style={typography.title} className="mt-4 text-brand-text">
                  Search destinations once your API is seeded
                </Text>
              </View>
            )}
          </View>
        </View>
      </AnimatedScrollView>

      <DateRangePickerSheet
        bottomSheetRef={dateSheetRef}
        initialCheckIn={filters.checkIn}
        initialCheckOut={filters.checkOut}
        onConfirm={setDateRange}
      />
      <GuestPickerSheet
        adults={filters.adults}
        bottomSheetRef={guestSheetRef}
        children={filters.children}
        onConfirm={setGuests}
        rooms={filters.rooms}
      />
    </View>
  );
}
