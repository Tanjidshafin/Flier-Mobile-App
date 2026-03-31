import React from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppIcon from '../../components/AppIcon';
import { AdminPaginationControls } from '../../components/admin/AdminPaginationControls';
import { AdminScreenLayout } from '../../components/admin/AdminScreenLayout';
import { EmptyState } from '../../components/app/EmptyState';
import { useAdminConversationsQuery } from '../../features/admin/hooks';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AdminStackParamList } from '../../types/navigation';
import { formatLongDate } from '../../utils/format';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminChatInbox'>;

export function AdminChatInboxScreen({ navigation }: Props) {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const query = useAdminConversationsQuery({ page, search, unreadOnly }, true);

  return (
    <AdminScreenLayout onBackPress={() => navigation.goBack()} title="Admin Chat">
      <FlatList
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 120 }}
        data={query.data?.items || []}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message={
              query.isLoading
                ? 'Loading conversations...'
                : 'Guest conversations will appear here once someone reaches out from the app.'
            }
            title="No conversations yet"
          />
        }
        ListFooterComponent={
          query.data?.pagination ? (
            <AdminPaginationControls
              onNext={() => setPage(current => current + 1)}
              onPrevious={() => setPage(current => Math.max(current - 1, 1))}
              page={query.data.pagination.page}
              totalPages={query.data.pagination.totalPages}
            />
          ) : null
        }
        ListHeaderComponent={
          <View className="gap-4">
            <View className="rounded-[28px] bg-white p-5">
              <Text style={typography.title} className="text-brand-text">
                Guest inbox
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                Respond to guest questions quickly and track unread conversations in one place.
              </Text>
              <View className="mt-4 rounded-[20px] bg-brand-surfaceMuted px-4 py-3">
                <TextInput
                  onChangeText={value => {
                    setSearch(value);
                    setPage(1);
                  }}
                  placeholder="Search guest, hotel, or subject..."
                  placeholderTextColor={colors.textMuted}
                  style={[typography.body, { color: colors.textPrimary }]}
                  value={search}
                />
              </View>
              <Pressable
                className={`mt-4 flex-row items-center rounded-[18px] px-4 py-4 ${unreadOnly ? 'bg-brand-primary' : 'bg-brand-surfaceMuted'}`}
                onPress={() => {
                  setUnreadOnly(current => !current);
                  setPage(1);
                }}>
                <AppIcon
                  color={unreadOnly ? '#FFFFFF' : colors.textPrimary}
                  name="email-outline"
                  size={20}
                />
                <Text
                  style={[
                    typography.caption,
                    {
                      color: unreadOnly ? '#FFFFFF' : colors.textPrimary,
                      marginLeft: 10,
                    },
                  ]}>
                  Show unread only
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            className="rounded-[28px] bg-white p-5"
            onPress={() =>
              navigation.navigate('AdminChatConversation', {
                conversation: item,
                conversationId: item.id,
              })
            }>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text style={typography.title} className="text-brand-text">
                  {item.user.fullName}
                </Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: 6 }]}>
                  {item.hotel.name} · {item.hotel.locationLabel}
                </Text>
              </View>
              {item.unreadCount ? (
                <View className="rounded-full bg-brand-primary px-3 py-1.5">
                  <Text style={[typography.caption, { color: '#FFFFFF' }]}>
                    {item.unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 10 }]}>
              {item.lastMessagePreview || item.subject || 'Open the thread to respond.'}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 8 }]}>
              {formatLongDate(item.lastMessageAt)}
            </Text>
          </Pressable>
        )}
        refreshing={query.isRefetching}
        showsVerticalScrollIndicator={false}
      />
    </AdminScreenLayout>
  );
}
