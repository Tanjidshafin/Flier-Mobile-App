import React from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AdminPaginationControls } from '../../components/admin/AdminPaginationControls';
import { AdminScreenLayout } from '../../components/admin/AdminScreenLayout';
import { EmptyState } from '../../components/app/EmptyState';
import { PrimaryAction } from '../../components/app/PrimaryAction';
import {
  useAdminUsersQuery,
  useUpdateAdminUserRoleMutation,
  useUpdateAdminUserStatusMutation,
} from '../../features/admin/hooks';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AdminStackParamList } from '../../types/navigation';
import { formatLongDate } from '../../utils/format';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminUsers'>;

const roleFilters = ['all', 'user', 'admin'] as const;
const statusFilters = ['all', 'active', 'suspended'] as const;

export function AdminUsersScreen({ navigation }: Props) {
  const session = useAuthStore(state => state.session);
  const showToast = useUIStore(state => state.showToast);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [role, setRole] = React.useState<(typeof roleFilters)[number]>('all');
  const [status, setStatus] = React.useState<(typeof statusFilters)[number]>('all');
  const query = useAdminUsersQuery({ page, role, search, status }, true);
  const roleMutation = useUpdateAdminUserRoleMutation();
  const statusMutation = useUpdateAdminUserStatusMutation();

  return (
    <AdminScreenLayout onBackPress={() => navigation.goBack()} title="User Management">
      <FlatList
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 120 }}
        data={query.data?.items || []}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message={
              query.isLoading
                ? 'Loading users...'
                : 'No users match the current filters.'
            }
            title="No users found"
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
                Users and roles
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                Promote trusted operators, demote unused admin access, and suspend problematic accounts.
              </Text>
              <View className="mt-4 rounded-[20px] bg-brand-surfaceMuted px-4 py-3">
                <TextInput
                  onChangeText={value => {
                    setSearch(value);
                    setPage(1);
                  }}
                  placeholder="Search by name or email..."
                  placeholderTextColor={colors.textMuted}
                  style={[typography.body, { color: colors.textPrimary }]}
                  value={search}
                />
              </View>
              <View className="mt-4">
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Role filter
                </Text>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {roleFilters.map(item => {
                    const selected = role === item;
                    return (
                      <Pressable
                        className={`rounded-full px-4 py-2 ${selected ? 'bg-brand-primary' : 'bg-brand-surfaceMuted'}`}
                        key={item}
                        onPress={() => {
                          setRole(item);
                          setPage(1);
                        }}>
                        <Text
                          style={[
                            typography.caption,
                            { color: selected ? '#FFFFFF' : colors.textPrimary },
                          ]}>
                          {item}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View className="mt-4">
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  Status filter
                </Text>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {statusFilters.map(item => {
                    const selected = status === item;
                    return (
                      <Pressable
                        className={`rounded-full px-4 py-2 ${selected ? 'bg-brand-primary' : 'bg-brand-surfaceMuted'}`}
                        key={item}
                        onPress={() => {
                          setStatus(item);
                          setPage(1);
                        }}>
                        <Text
                          style={[
                            typography.caption,
                            { color: selected ? '#FFFFFF' : colors.textPrimary },
                          ]}>
                          {item}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isSelf = session?.user.id === item.id;
          const nextRole = item.role === 'admin' ? 'user' : 'admin';
          const nextStatus = item.status === 'active' ? 'suspended' : 'active';

          return (
            <View className="rounded-[28px] bg-white p-5">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text style={typography.title} className="text-brand-text">
                    {item.fullName}
                  </Text>
                  <Text style={[typography.body, { color: colors.textSecondary, marginTop: 6 }]}>
                    {item.email}
                  </Text>
                </View>
                <View className="items-end gap-2">
                  <View className="rounded-full bg-brand-surfaceMuted px-3 py-1.5">
                    <Text style={[typography.caption, { color: colors.textPrimary }]}>
                      {item.role}
                    </Text>
                  </View>
                  <View
                    className={`rounded-full px-3 py-1.5 ${item.status === 'active' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: item.status === 'active' ? colors.success : colors.error,
                        },
                      ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 10 }]}>
                Joined {formatLongDate(item.createdAt || new Date().toISOString())}
              </Text>
              {item.suspensionReason ? (
                <Text style={[typography.body, { color: colors.error, marginTop: 8 }]}>
                  Reason: {item.suspensionReason}
                </Text>
              ) : null}
              {isSelf ? (
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                  This is your current account.
                </Text>
              ) : null}

              <View className="mt-4 flex-row gap-3">
                <View className="flex-1">
                  <PrimaryAction
                    disabled={roleMutation.isPending}
                    label={item.role === 'admin' ? 'Demote' : 'Promote'}
                    onPress={async () => {
                      try {
                        await roleMutation.mutateAsync({
                          role: nextRole,
                          userId: item.id,
                        });
                        showToast({
                          message: `${item.fullName} is now ${nextRole}.`,
                          title: 'Role updated',
                          tone: 'success',
                        });
                      } catch (error) {
                        showToast({
                          message:
                            error instanceof Error
                              ? error.message
                              : 'Unable to update role.',
                          title: 'Role update failed',
                          tone: 'error',
                        });
                      }
                    }}
                    variant="secondary"
                  />
                </View>
                <View className="flex-1">
                  <PrimaryAction
                    disabled={statusMutation.isPending}
                    label={item.status === 'active' ? 'Suspend' : 'Reactivate'}
                    onPress={async () => {
                      try {
                        await statusMutation.mutateAsync({
                          reason:
                            item.status === 'active'
                              ? 'Suspended from the mobile admin panel'
                              : undefined,
                          status: nextStatus,
                          userId: item.id,
                        });
                        showToast({
                          message: `${item.fullName} is now ${nextStatus}.`,
                          title: 'Status updated',
                          tone: 'success',
                        });
                      } catch (error) {
                        showToast({
                          message:
                            error instanceof Error
                              ? error.message
                              : 'Unable to update status.',
                          title: 'Status update failed',
                          tone: 'error',
                        });
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          );
        }}
        refreshing={query.isRefetching}
        showsVerticalScrollIndicator={false}
      />
    </AdminScreenLayout>
  );
}
