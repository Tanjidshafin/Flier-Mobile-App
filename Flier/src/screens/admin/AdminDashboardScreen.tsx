import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppIcon from '../../components/AppIcon';
import { AdminScreenLayout } from '../../components/admin/AdminScreenLayout';
import { EmptyState } from '../../components/app/EmptyState';
import { useAdminDashboardQuery } from '../../features/admin/hooks';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AdminStackParamList } from '../../types/navigation';
import { formatCurrency, formatLongDate } from '../../utils/format';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

const statMeta = [
  { key: 'totalUsers', icon: 'account-group-outline', label: 'Users' },
  { key: 'totalAdmins', icon: 'shield-check-outline', label: 'Admins' },
  { key: 'activeHotels', icon: 'home-outline', label: 'Hotels' },
  { key: 'confirmedBookings', icon: 'calendar-range', label: 'Bookings' },
] as const;

const quickActions = [
  {
    icon: 'home-outline',
    label: 'Manage hotels',
    screen: 'AdminHotels',
  },
  {
    icon: 'account-group-outline',
    label: 'Manage users',
    screen: 'AdminUsers',
  },
  {
    icon: 'email-outline',
    label: 'Open admin chat',
    screen: 'AdminChatInbox',
  },
] as const;

export function AdminDashboardScreen({ navigation }: Props) {
  const query = useAdminDashboardQuery(true);

  return (
    <AdminScreenLayout
      rightAccessory={
        <Pressable onPress={() => navigation.navigate('AdminNotifications')}>
          <AppIcon color={colors.textPrimary} name="bell-outline" size={22} />
        </Pressable>
      }
      title="Admin Dashboard">
      <ScrollView
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.caption} className="text-brand-muted">
            Operational overview
          </Text>
          <Text style={typography.heading} className="mt-2 text-brand-text">
            Keep Flier running smoothly
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 10 }]}>
            Watch platform growth, jump into conversations, and manage hotels without leaving the app.
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {statMeta.map(item => (
            <View
              className="mb-4 rounded-[26px] bg-white p-4"
              key={item.key}
              style={{ width: '48%' }}>
              <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-surfaceElevated">
                <AppIcon color={colors.primary} name={item.icon} size={24} />
              </View>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 14 }]}>
                {item.label}
              </Text>
              <Text style={[typography.title, { marginTop: 4 }]} className="text-brand-text">
                {query.data?.stats[item.key] ?? '--'}
              </Text>
            </View>
          ))}
        </View>

        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.caption} className="text-brand-muted">
            Revenue snapshot
          </Text>
          <Text style={[typography.heading, { marginTop: 8 }]} className="text-brand-text">
            {formatCurrency(query.data?.stats.netRevenue ?? 0, 'USD')}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
            Net revenue from confirmed paid bookings after refunds.
          </Text>
        </View>

        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Quick actions
          </Text>
          <View className="mt-4 gap-3">
            {quickActions.map(action => (
              <Pressable
                className="flex-row items-center rounded-[22px] bg-brand-surfaceMuted px-4 py-4"
                key={action.label}
                onPress={() => navigation.navigate(action.screen)}>
                <View className="h-11 w-11 items-center justify-center rounded-full bg-white">
                  <AppIcon color={colors.primary} name={action.icon} size={22} />
                </View>
                <Text style={[typography.body, { marginLeft: 14 }]} className="flex-1 text-brand-text">
                  {action.label}
                </Text>
                <AppIcon color={colors.textMuted} name="chevron-right" size={22} />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="rounded-[30px] bg-white p-5">
          <Text style={typography.title} className="text-brand-text">
            Recent activity
          </Text>
          {query.data?.recentActivity.length ? (
            <View className="mt-4 gap-3">
              {query.data.recentActivity.map(activity => (
                <View
                  className="rounded-[22px] bg-brand-surfaceMuted px-4 py-4"
                  key={activity.id}>
                  <Text style={typography.body} className="text-brand-text">
                    {activity.title}
                  </Text>
                  <Text
                    style={[typography.body, { color: colors.textSecondary, marginTop: 6 }]}>
                    {activity.description}
                  </Text>
                  <Text
                    style={[typography.caption, { color: colors.textMuted, marginTop: 8 }]}>
                    {formatLongDate(activity.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              message={
                query.isLoading
                  ? 'Loading the latest platform activity...'
                  : 'Admin activity will appear here as bookings, users, and messages come in.'
              }
              title="No activity yet"
            />
          )}
        </View>
      </ScrollView>
    </AdminScreenLayout>
  );
}
