import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../components/app/EmptyState';
import { HotelCard } from '../components/app/HotelCard';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { typography } from '../theme/typography';
import { MainTabParamList } from '../types/navigation';

type Props = BottomTabScreenProps<MainTabParamList, 'Wishlist'>;

export function WishlistScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const session = useAuthStore(state => state.session);
  const guestItems = useWishlistStore(state => state.guestItems);
  const hydrateRemoteWishlist = useWishlistStore(state => state.hydrateRemoteWishlist);
  const isSaved = useWishlistStore(state => state.isSaved);
  const remoteItems = useWishlistStore(state => state.remoteItems);
  const toggleSaved = useWishlistStore(state => state.toggleSaved);
  const items = React.useMemo(
    () => (session ? remoteItems.map(item => item.hotel) : guestItems),
    [guestItems, remoteItems, session],
  );

  useFocusEffect(
    React.useCallback(() => {
      if (session) {
        void hydrateRemoteWishlist();
      }
    }, [hydrateRemoteWishlist, session]),
  );

  return (
    <View className="flex-1 bg-brand-surfaceMuted" style={{ paddingTop: insets.top + 12 }}>
      <View className="px-5 pb-4">
        <Text style={typography.heading} className="text-brand-text">
          Wishlist
        </Text>
        <Text style={typography.body} className="mt-2 text-brand-muted">
          {session
            ? 'Saved stays synced to your account.'
            : 'Your saved hotels stay on this device until you sign in.'}
        </Text>
      </View>

      <FlatList
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 120 }}
        data={items}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message="Heart a hotel from Home, Search, or Details and it will appear here."
            title="Nothing saved yet"
          />
        }
        numColumns={2}
        renderItem={({ item }) => (
          <View className="flex-1">
            <HotelCard
              compact
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
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
