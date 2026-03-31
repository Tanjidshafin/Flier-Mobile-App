import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';

import { AdminScreenLayout } from '../../components/admin/AdminScreenLayout';
import { EmptyState } from '../../components/app/EmptyState';
import {
  useAdminNotificationsQuery,
  useDeleteAdminNotificationMutation,
  useMarkAdminNotificationReadMutation,
} from '../../features/admin/hooks';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AdminStackParamList } from '../../types/navigation';
import { NotificationItem } from '../../types/notification';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminNotifications'>;

export function AdminNotificationsScreen({ navigation }: Props) {
  const query = useAdminNotificationsQuery(true);
  const markReadMutation = useMarkAdminNotificationReadMutation();
  const deleteMutation = useDeleteAdminNotificationMutation();

  const openNotification = React.useCallback(
    async (item: NotificationItem) => {
      if (!item.isRead) {
        await markReadMutation.mutateAsync(item.id);
      }

      if (item.data.conversationId || item.data.routeName === 'AdminChatConversation') {
        navigation.navigate('AdminChatConversation', {
          conversationId: item.data.conversationId || undefined,
        });
        return;
      }

      if (item.data.routeName === 'AdminUsers') {
        navigation.navigate('AdminUsers');
        return;
      }

      navigation.navigate('AdminDashboard');
    },
    [markReadMutation, navigation],
  );

  return (
    <AdminScreenLayout onBackPress={() => navigation.goBack()} title="Admin Notifications">
      <FlatList
        contentContainerStyle={{ gap: 14, padding: 20, paddingBottom: 120 }}
        data={query.data || []}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message="Operational alerts for bookings, new users, and guest messages will appear here."
            title="No admin notifications"
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
                ) : null}
              </View>
            </Pressable>
          </Swipeable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </AdminScreenLayout>
  );
}
