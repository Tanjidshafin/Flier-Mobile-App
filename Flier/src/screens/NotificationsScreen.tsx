import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { EmptyState } from '../components/app/EmptyState';
import { ScreenHeader } from '../components/app/ScreenHeader';
import {
  useDeleteNotificationMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../features/notifications/hooks';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types/navigation';
import { NotificationItem } from '../types/notification';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const query = useNotificationsQuery(true);
  const markReadMutation = useMarkNotificationReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const openNotification = React.useCallback(
    async (item: NotificationItem) => {
      if (!item.isRead) {
        await markReadMutation.mutateAsync(item.id);
      }

      if (item.data.routeName === 'Chat' || item.data.conversationId) {
        navigation.navigate('Chat', {
          conversationId: item.data.conversationId || undefined,
          hotelSlug: item.data.hotelSlug || undefined,
        });
        return;
      }

      if (item.data.routeName === 'BookingSuccess' || item.data.bookingId) {
        navigation.navigate('BookingSuccess', {
          bookingId: item.data.bookingId || '',
        });
        return;
      }

      if (item.data.hotelSlug) {
        navigation.navigate('HotelDetails', {
          hotelSlug: item.data.hotelSlug,
        });
      }
    },
    [markReadMutation, navigation],
  );

  return (
    <View className="flex-1 bg-brand-surfaceMuted" style={{ paddingTop: insets.top + 12 }}>
      <View className="px-5">
        <ScreenHeader onBackPress={() => navigation.goBack()} title="Notifications" />
      </View>

      <FlatList
        contentContainerStyle={{ gap: 14, padding: 20, paddingBottom: 120 }}
        data={query.data || []}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message="Booking updates, chat replies, and system alerts will land here."
            title="No notifications yet"
          />
        }
        refreshing={query.isRefetching}
        renderItem={({ item }) => (
          <Swipeable
            friction={2}
            overshootLeft={false}
            renderLeftActions={() => (
              <Pressable
                className="mr-3 items-center justify-center rounded-[24px] bg-red-500 px-5"
                onPress={() => {
                  void deleteMutation.mutateAsync(item.id);
                }}>
                <Text style={[typography.caption, { color: '#FFFFFF' }]}>Delete</Text>
              </Pressable>
            )}>
            <Pressable
              className={`rounded-[26px] p-4 ${item.isRead ? 'bg-white' : 'bg-brand-surfaceElevated'}`}
              onPress={() => {
                void openNotification(item);
              }}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text style={typography.title} className="text-brand-text">
                    {item.title}
                  </Text>
                  <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                    {item.body}
                  </Text>
                </View>
                {!item.isRead ? (
                  <View className="mt-1 h-3 w-3 rounded-full bg-brand-primary" />
                ) : (
                  <AppIcon color={colors.textMuted} name="bell-outline" size={18} />
                )}
              </View>
            </Pressable>
          </Swipeable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
