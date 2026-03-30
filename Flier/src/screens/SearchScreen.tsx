import React from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { FilterSheet } from '../components/app/FilterSheet';
import { EmptyState } from '../components/app/EmptyState';
import { HotelCard } from '../components/app/HotelCard';
import { LoadingCard } from '../components/app/LoadingCard';
import { ScreenHeader } from '../components/app/ScreenHeader';
import { SORT_OPTIONS } from '../constants/hotel';
import {
  fetchDestinationSuggestions,
  fetchHotels,
} from '../services/api';
import { useSearchStore } from '../store/searchStore';
import { useWishlistStore } from '../store/wishlistStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainTabParamList } from '../types/navigation';
import { DestinationSuggestion, HotelSummary } from '../types/hotel';

type Props = BottomTabScreenProps<MainTabParamList, 'Search'>;

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
      <Text style={[typography.caption, { color: colors.textPrimary, marginLeft: 6 }]}>{label}</Text>
    </View>
  );
}

export function SearchScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const filterSheetRef = React.useRef<BottomSheetModal>(null);
  const filters = useSearchStore(state => state.filters);
  const destinationLabel = useSearchStore(state => state.destinationLabel);
  const setDestination = useSearchStore(state => state.setDestination);
  const setFilters = useSearchStore(state => state.setFilters);
  const setQuery = useSearchStore(state => state.setQuery);
  const toggleSaved = useWishlistStore(state => state.toggleSaved);
  const isSaved = useWishlistStore(state => state.isSaved);
  const [items, setItems] = React.useState<HotelSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [suggestions, setSuggestions] = React.useState<DestinationSuggestion[]>([]);
  const launchedFromHome = route.params?.source === 'home';
  const pickDestinationMode = route.params?.mode === 'pick-destination';
  const hasDestination = Boolean(destinationLabel.trim() && filters.destinationId);
  const shouldLoadHotels = hasDestination;

  const clearSearchContext = React.useCallback(() => {
    navigation.setParams({
      mode: 'browse',
      source: undefined,
    });
  }, [navigation]);

  const loadHotels = React.useCallback(async (showRefreshing = false) => {
    if (!shouldLoadHotels) {
      setItems([]);
      setError('');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError('');
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetchHotels(filters);
      setItems(response.items);
    } catch {
      setError('Unable to load hotels for this search.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, shouldLoadHotels]);

  React.useEffect(() => {
    if (!shouldLoadHotels) {
      setItems([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      loadHotels();
    }, 250);

    return () => clearTimeout(timer);
  }, [filters, loadHotels, shouldLoadHotels]);

  React.useEffect(() => {
    const normalizedQuery = filters.query.trim();
    if (normalizedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetchDestinationSuggestions(normalizedQuery);
        setSuggestions(response);
      } catch {
        setSuggestions([]);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [filters.query]);

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
          {pickDestinationMode && !hasDestination ? 'Choose your destination' : 'Search stays'}
        </Text>
        <Text style={[typography.heading, { fontSize: 28 }]} className="mt-2 text-brand-text">
          {hasDestination ? destinationLabel : 'Where do you want to stay?'}
        </Text>
        {hasDestination ? (
          <View className="mt-3 flex-row flex-wrap gap-2">
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
        ) : (
          <Text style={typography.body} className="mt-2 text-brand-muted">
            Search for a city or area first, then we’ll show matching stays.
          </Text>
        )}

        <View className="mt-4 flex-row items-center rounded-[22px] border border-brand-border bg-white px-4 py-3">
          <AppIcon color={colors.textMuted} name="magnify" size={22} />
          <TextInput
            placeholder="Search city, area, or hotel"
            placeholderTextColor={colors.textMuted}
            style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: 10 }]}
            value={filters.query}
            onChangeText={setQuery}
            autoFocus={pickDestinationMode}
          />
          <Pressable
            className="ml-3 rounded-full bg-brand-surfaceMuted p-2"
            onPress={() => filterSheetRef.current?.present()}>
            <AppIcon color={colors.textPrimary} name="tune-variant" size={20} />
          </Pressable>
        </View>

        {suggestions.length ? (
          <View className="mt-3 rounded-[24px] bg-white px-3 py-3">
            {suggestions.map(suggestion => (
              <Pressable
                className="flex-row items-center justify-between rounded-[18px] px-3 py-3"
                key={suggestion.destinationId}
                onPress={() => {
                  setDestination(
                    suggestion.destinationId,
                    suggestion.label,
                    suggestion.label,
                  );
                  setSuggestions([]);

                  if (launchedFromHome) {
                    clearSearchContext();
                    navigation.navigate('Home');
                  }
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
              disabled={!hasDestination}
              onPress={() => setFilters({ sortBy: option.value })}>
              <Text
                style={[
                  typography.body,
                  { color: filters.sortBy === option.value ? '#FFFFFF' : colors.textPrimary, fontSize: 13 },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 120 }}
        data={loading && shouldLoadHotels ? new Array(3).fill(null) : items}
        keyExtractor={(item, index) => item?.id ?? `loading-${index}`}
        refreshing={refreshing}
        renderItem={({ item }) =>
          item ? (
            <HotelCard
              hotel={item}
              onPress={() =>
                navigation.getParent()?.navigate('HotelDetails', {
                  hotel: item,
                  hotelSlug: item.slug,
                })
              }
              onToggleSaved={() => toggleSaved(item)}
              saved={isSaved(item.id)}
            />
          ) : (
            <LoadingCard />
          )
        }
        ListEmptyComponent={
          !loading ? (
            shouldLoadHotels ? (
              <EmptyState
                message={error || 'Try a different city, date range, or filter combination.'}
                title="No hotels matched this search"
              />
            ) : (
              <EmptyState
                message="Pick a destination from the search suggestions to start browsing available hotels."
                title="Choose a destination first"
              />
            )
          ) : null
        }
        onRefresh={() => {
          if (shouldLoadHotels) {
            loadHotels(true);
          }
        }}
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
