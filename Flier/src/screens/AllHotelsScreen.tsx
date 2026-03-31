import React from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { EmptyState } from '../components/app/EmptyState';
import { FilterSheet } from '../components/app/FilterSheet';
import { HotelCard } from '../components/app/HotelCard';
import { LoadingCard } from '../components/app/LoadingCard';
import { ScreenHeader } from '../components/app/ScreenHeader';
import { SORT_OPTIONS } from '../constants/hotel';
import {
  useDestinationSuggestions,
  useInfiniteHotelSearch,
} from '../features/hotels/hooks';
import { useUIStore } from '../store/uiStore';
import { useSearchStore } from '../store/searchStore';
import { useWishlistStore } from '../store/wishlistStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { HotelSummary } from '../types/hotel';
import { MainTabParamList } from '../types/navigation';

type Props = BottomTabScreenProps<MainTabParamList, 'Search'>;

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}

function FilterSummaryItem({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
}) {
  return (
    <View className="flex-row items-center rounded-full bg-white px-3 py-2">
      <AppIcon color={colors.primary} name={icon} size={16} />
      <Text style={[typography.caption, { color: colors.textPrimary, marginLeft: 6 }]}>
        {label}
      </Text>
    </View>
  );
}

export function AllHotelsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const filterSheetRef = React.useRef<BottomSheetModal>(null);
  const filters = useSearchStore(state => state.filters);
  const destinationLabel = useSearchStore(state => state.destinationLabel);
  const searchText = useSearchStore(state => state.searchText);
  const setDestination = useSearchStore(state => state.setDestination);
  const setFilters = useSearchStore(state => state.setFilters);
  const setSearchText = useSearchStore(state => state.setSearchText);
  const toggleSaved = useWishlistStore(state => state.toggleSaved);
  const isSaved = useWishlistStore(state => state.isSaved);
  const showToast = useUIStore(state => state.showToast);
  const launchedFromHome = route.params?.source === 'home';
  const pickDestinationMode = route.params?.mode === 'pick-destination';
  const debouncedSearchText = useDebouncedValue(searchText, 280);
  const shouldShowDestinationSuggestions =
    pickDestinationMode || !destinationLabel || searchText !== debouncedSearchText;
  const suggestionsQuery = useDestinationSuggestions(
    shouldShowDestinationSuggestions ? searchText : '',
  );
  const hotelsQuery = useInfiniteHotelSearch(
    {
      ...filters,
      limit: 10,
      searchText: debouncedSearchText,
    },
    true,
  );

  const items = React.useMemo(
    () => hotelsQuery.data?.pages.flatMap(page => page.items) ?? [],
    [hotelsQuery.data],
  );

  const clearSearchContext = React.useCallback(() => {
    navigation.setParams({
      mode: 'browse',
      source: undefined,
    });
  }, [navigation]);

  const renderHotel = React.useCallback(
    ({ item }: ListRenderItemInfo<HotelSummary | null>) =>
      item ? (
        <HotelCard
          hotel={item}
          onPress={() =>
            navigation.getParent()?.navigate('HotelDetails', {
              hotel: item,
              hotelSlug: item.slug,
            })
          }
          onToggleSaved={() => {
            void toggleSaved(item);
            showToast({
              message: isSaved(item.id)
                ? 'Removed from your wishlist.'
                : 'Saved to your wishlist.',
              title: 'Wishlist',
              tone: 'success',
            });
          }}
          saved={isSaved(item.id)}
        />
      ) : (
        <LoadingCard />
      ),
    [isSaved, navigation, showToast, toggleSaved],
  );

  const hasActiveFilters = Boolean(
    destinationLabel ||
      filters.amenities.length ||
      filters.maxPrice ||
      filters.minPrice ||
      filters.minRating,
  );

  const isInitialLoading = hotelsQuery.isLoading && items.length === 0;
  const listData: Array<HotelSummary | null> = isInitialLoading
    ? new Array(4).fill(null)
    : items;

  return (
    <View className="flex-1 bg-brand-surfaceMuted" style={{ paddingTop: insets.top + 12 }}>
      <View className="px-5">
        {launchedFromHome ? (
          <ScreenHeader
            onBackPress={() => {
              clearSearchContext();
              navigation.navigate('Home');
            }}
          />
        ) : null}
        <Text style={typography.body} className="text-brand-muted">
          {pickDestinationMode ? 'Choose a destination or search a hotel' : 'All hotels'}
        </Text>
        <Text style={[typography.heading, { fontSize: 28 }]} className="mt-2 text-brand-text">
          {destinationLabel || 'Explore modern stays'}
        </Text>
        <Text style={typography.body} className="mt-2 text-brand-muted">
          {destinationLabel
            ? 'Destination is locked in, but free-text search only filters results now.'
            : 'Browse all hotels, or pick a destination for sharper results.'}
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {destinationLabel ? (
            <FilterSummaryItem icon="map-marker-outline" label={destinationLabel} />
          ) : null}
          <FilterSummaryItem
            icon="account-group-outline"
            label={`${filters.adults + filters.children} guests`}
          />
          <FilterSummaryItem icon="bed-outline" label={`${filters.rooms} room`} />
          <FilterSummaryItem
            icon="calendar-range"
            label={`${filters.checkIn} to ${filters.checkOut}`}
          />
        </View>

        <View className="mt-4 flex-row items-center rounded-[22px] border border-brand-border bg-white px-4 py-3">
          <AppIcon color={colors.textMuted} name="magnify" size={22} />
          <TextInput
            autoFocus={pickDestinationMode}
            onChangeText={setSearchText}
            placeholder="Search city, area, or hotel"
            placeholderTextColor={colors.textMuted}
            style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: 10 }]}
            value={searchText}
          />
          <Pressable
            className="ml-3 rounded-full bg-brand-surfaceMuted p-2"
            onPress={() => filterSheetRef.current?.present()}>
            <AppIcon color={colors.textPrimary} name="tune-variant" size={20} />
          </Pressable>
        </View>

        {suggestionsQuery.data?.length && shouldShowDestinationSuggestions ? (
          <View className="mt-3 rounded-[24px] bg-white px-3 py-3">
            {suggestionsQuery.data.map(suggestion => (
              <Pressable
                className="flex-row items-center justify-between rounded-[18px] px-3 py-3"
                key={suggestion.destinationId}
                onPress={() => {
                  setDestination(suggestion.destinationId, suggestion.label, '');
                  clearSearchContext();
                }}>
                <View>
                  <Text style={[typography.body, { color: colors.textPrimary }]}>
                    {suggestion.label}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {suggestion.secondaryLabel}
                  </Text>
                </View>
                <AppIcon color={colors.primary} name="arrow-top-right" size={20} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View className="mt-4 flex-row flex-wrap gap-2">
          {SORT_OPTIONS.map(option => (
            <Pressable
              className={`rounded-full border px-4 py-2 ${filters.sortBy === option.value ? 'border-brand-primary bg-brand-primary' : 'border-brand-border bg-white'}`}
              key={option.value}
              onPress={() => setFilters({ sortBy: option.value })}>
              <Text
                style={[
                  typography.body,
                  {
                    color:
                      filters.sortBy === option.value ? '#FFFFFF' : colors.textPrimary,
                    fontSize: 13,
                  },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 140 }}
        data={listData}
        keyExtractor={(item, index) => item?.id ?? `loading-${index}`}
        ListEmptyComponent={
          !hotelsQuery.isLoading ? (
            <EmptyState
              message={
                hotelsQuery.error instanceof Error
                  ? hotelsQuery.error.message
                  : hasActiveFilters
                    ? 'Try a different destination, keyword, or filter combination.'
                    : 'No hotels are available right now.'
              }
              title={hotelsQuery.error ? 'Unable to load hotels' : 'No hotels matched'}
            />
          ) : null
        }
        ListFooterComponent={
          hotelsQuery.isFetchingNextPage ? (
            <View className="gap-4">
              <LoadingCard />
              <LoadingCard />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (hotelsQuery.hasNextPage && !hotelsQuery.isFetchingNextPage) {
            void hotelsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.35}
        onRefresh={() => {
          void hotelsQuery.refetch();
        }}
        refreshing={hotelsQuery.isRefetching && !hotelsQuery.isFetchingNextPage}
        renderItem={renderHotel}
        showsVerticalScrollIndicator={false}
      />

      <FilterSheet
        bottomSheetRef={filterSheetRef}
        filters={filters}
        onChange={setFilters}
      />
    </View>
  );
}
