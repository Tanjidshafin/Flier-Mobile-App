import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { EmptyState } from '../components/app/EmptyState';
import { PrimaryAction } from '../components/app/PrimaryAction';
import { AuthTextField } from '../components/auth/AuthTextField';
import {
  useBookingsQuery,
  useCancelBookingMutation,
} from '../features/bookings/hooks';
import {
  uploadAvatarToCloudinary,
  useUpdateProfileMutation,
} from '../features/profile/hooks';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { MainTabParamList } from '../types/navigation';
import { createIdempotencyKey } from '../utils/idempotency';
import { formatCurrency, formatLongDate } from '../utils/format';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const session = useAuthStore(state => state.session);
  const signOut = useAuthStore(state => state.signOut);
  const showToast = useUIStore(state => state.showToast);
  const bookingsQuery = useBookingsQuery(Boolean(session));
  const updateProfileMutation = useUpdateProfileMutation();
  const cancelBookingMutation = useCancelBookingMutation();
  const [fullName, setFullName] = React.useState(session?.user.fullName || '');
  const [email, setEmail] = React.useState(session?.user.email || '');
  const [phoneNumber, setPhoneNumber] = React.useState(session?.user.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = React.useState(session?.user.avatar?.url || '');
  const [avatarPublicId, setAvatarPublicId] = React.useState(
    session?.user.avatar?.publicId || '',
  );
  const [savingAvatar, setSavingAvatar] = React.useState(false);

  React.useEffect(() => {
    setFullName(session?.user.fullName || '');
    setEmail(session?.user.email || '');
    setPhoneNumber(session?.user.phoneNumber || '');
    setAvatarUrl(session?.user.avatar?.url || '');
    setAvatarPublicId(session?.user.avatar?.publicId || '');
  }, [session?.user]);

  if (!session) {
    return (
      <View className="flex-1 bg-brand-surfaceMuted px-5" style={{ paddingTop: insets.top + 22 }}>
        <Text style={typography.heading} className="text-brand-text">
          Profile
        </Text>
        <Text style={typography.body} className="mt-2 text-brand-muted">
          Sign in to manage bookings, chat with hotels, and keep your profile in sync.
        </Text>

        <View className="mt-8 rounded-[30px] bg-white p-6">
          <Text style={typography.title} className="text-brand-text">
            Your account unlocks the full booking flow
          </Text>
          <Text style={typography.body} className="mt-3 text-brand-muted">
            Guests can browse, but reservations, chat, notifications, and history live behind your account.
          </Text>
          <PrimaryAction
            label="Sign In"
            onPress={() => navigation.getParent()?.navigate('Login', { source: 'profile' })}
            style={{ marginTop: 18 }}
          />
          <PrimaryAction
            label="Create Account"
            onPress={() => navigation.getParent()?.navigate('Register', { source: 'profile' })}
            style={{ marginTop: 12 }}
            variant="secondary"
          />
        </View>
      </View>
    );
  }

  const bookings = bookingsQuery.data || [];

  return (
    <View className="flex-1 bg-brand-surfaceMuted" style={{ paddingTop: insets.top + 18 }}>
      <FlatList
        contentContainerStyle={{ gap: 16, padding: 20, paddingBottom: 120 }}
        data={bookings}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            message="Your confirmed reservations will appear here after you complete a booking."
            title="No bookings yet"
          />
        }
        ListHeaderComponent={
          <View className="gap-4">
            <View className="rounded-[28px] bg-white p-5">
              <View className="flex-row items-center">
                <View className="h-20 w-20 overflow-hidden rounded-full bg-brand-surfaceMuted">
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} resizeMode="cover" style={{ flex: 1 }} />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <AppIcon color={colors.primary} name="account-outline" size={34} />
                    </View>
                  )}
                </View>
                <View className="ml-4 flex-1">
                  <Text style={typography.heading} className="text-[24px] text-brand-text">
                    {session.user.fullName}
                  </Text>
                  <Text style={typography.body} className="mt-1 text-brand-muted">
                    {session.user.email}
                  </Text>
                  <View className="mt-3 flex-row gap-2">
                    <View className="rounded-full bg-brand-surfaceMuted px-3 py-1.5">
                      <Text style={[typography.caption, { color: colors.textPrimary }]}>
                        {session.user.role}
                      </Text>
                    </View>
                    <View
                      className={`rounded-full px-3 py-1.5 ${session.user.status === 'active' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <Text
                        style={[
                          typography.caption,
                          {
                            color:
                              session.user.status === 'active'
                                ? colors.success
                                : colors.error,
                          },
                        ]}>
                        {session.user.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <PrimaryAction
                disabled={savingAvatar}
                label={savingAvatar ? 'Uploading photo...' : 'Update photo'}
                onPress={async () => {
                  try {
                    setSavingAvatar(true);
                    const uploaded = await uploadAvatarToCloudinary();

                    if (!uploaded) {
                      return;
                    }

                    setAvatarUrl(uploaded.url);
                    setAvatarPublicId(uploaded.publicId);
                    showToast({
                      message: 'Profile photo ready to save.',
                      title: 'Avatar updated',
                      tone: 'success',
                    });
                  } catch (caughtError) {
                    showToast({
                      message:
                        caughtError instanceof Error
                          ? caughtError.message
                          : 'Unable to upload avatar right now.',
                      title: 'Upload failed',
                      tone: 'error',
                    });
                  } finally {
                    setSavingAvatar(false);
                  }
                }}
                style={{ marginTop: 16 }}
                variant="secondary"
              />
            </View>

            <View className="rounded-[28px] bg-white p-5">
              <Text style={typography.title} className="text-brand-text">
                Account details
              </Text>
              <View className="mt-4 gap-3">
                <AuthTextField
                  label="Full name"
                  placeholder="Your name"
                  value={fullName}
                  onChangeText={setFullName}
                />
                <AuthTextField
                  autoCapitalize="none"
                  keyboardType="email-address"
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                />
                <AuthTextField
                  keyboardType="phone-pad"
                  label="Phone"
                  placeholder="+8801..."
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
              <PrimaryAction
                disabled={updateProfileMutation.isPending}
                label={updateProfileMutation.isPending ? 'Saving profile...' : 'Save profile'}
                onPress={async () => {
                  try {
                    const response = await updateProfileMutation.mutateAsync({
                      avatarPublicId: avatarPublicId || null,
                      avatarUrl: avatarUrl || null,
                      email: email.trim(),
                      fullName: fullName.trim(),
                      phoneNumber: phoneNumber.trim() || null,
                    });

                    useAuthStore.setState({
                      session: response.session,
                    });
                    showToast({
                      message: 'Profile updated successfully.',
                      title: 'Saved',
                      tone: 'success',
                    });
                  } catch (caughtError) {
                    showToast({
                      message:
                        caughtError instanceof Error
                          ? caughtError.message
                          : 'Unable to save profile.',
                      title: 'Save failed',
                      tone: 'error',
                    });
                  }
                }}
                style={{ marginTop: 16 }}
              />
            </View>

            {session.user.role === 'admin' ? (
              <View className="rounded-[28px] bg-white p-5">
                <Text style={typography.title} className="text-brand-text">
                  Admin Panel
                </Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                  Open the protected admin workspace to manage hotels, users, guest chats, and notifications.
                </Text>
                <PrimaryAction
                  label="Open Admin Panel"
                  onPress={() => navigation.getParent()?.navigate('AdminPanel')}
                  style={{ marginTop: 16 }}
                />
              </View>
            ) : null}

            <View className="flex-row items-center justify-between">
              <Text style={[typography.title, { color: colors.textPrimary }]}>
                Booking history
              </Text>
              <Pressable onPress={() => navigation.getParent()?.navigate('Notifications')}>
                <Text style={[typography.caption, { color: colors.primary }]}>
                  Notifications
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="rounded-[28px] bg-white p-4">
            <Text style={typography.title} className="text-brand-text">
              {item.hotel.name}
            </Text>
            <View className="mt-1 flex-row items-center">
              <AppIcon color={colors.textMuted} name="map-marker-outline" size={16} />
              <Text style={[typography.body, { marginLeft: 6 }]} className="text-brand-muted">
                {item.hotel.locationLabel}
              </Text>
            </View>
            <View className="mt-3 flex-row items-center">
              <AppIcon color={colors.primary} name="calendar-range" size={16} />
              <Text style={[typography.body, { marginLeft: 8 }]} className="text-brand-text">
                {formatLongDate(item.checkIn)} - {formatLongDate(item.checkOut)}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center">
              <AppIcon color={colors.textSecondary} name="shield-check-outline" size={16} />
              <Text style={[typography.body, { marginLeft: 8 }]} className="text-brand-muted">
                {item.confirmationCode}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center">
              <AppIcon color={colors.textSecondary} name="bed-outline" size={16} />
              <Text style={[typography.body, { marginLeft: 8 }]} className="text-brand-muted">
                {item.roomType.name}
              </Text>
            </View>
            <View className="mt-4 flex-row items-center justify-between">
              <Text style={typography.title} className="text-brand-text">
                {formatCurrency(item.pricing.totalAmount, item.pricing.currency)}
              </Text>
              <View className="rounded-full bg-brand-surfaceMuted px-3 py-1.5">
                <Text style={[typography.caption, { color: colors.primary }]}>
                  {item.bookingStatus.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <PrimaryAction
                  label="Open"
                  onPress={() =>
                    navigation.getParent()?.navigate('BookingSuccess', {
                      bookingId: item.id,
                    })
                  }
                  variant="secondary"
                />
              </View>
              {item.canCancel ? (
                <View className="flex-1">
                  <PrimaryAction
                    disabled={cancelBookingMutation.isPending}
                    label="Cancel"
                    onPress={async () => {
                      try {
                        await cancelBookingMutation.mutateAsync({
                          bookingId: item.id,
                          payload: {
                            idempotencyKey: createIdempotencyKey('cancel'),
                            reason: 'Cancelled from profile',
                          },
                        });
                        showToast({
                          message: 'Booking cancelled successfully.',
                          title: 'Booking updated',
                          tone: 'success',
                        });
                      } catch (caughtError) {
                        showToast({
                          message:
                            caughtError instanceof Error
                              ? caughtError.message
                              : 'Unable to cancel booking.',
                          title: 'Cancel failed',
                          tone: 'error',
                        });
                      }
                    }}
                  />
                </View>
              ) : null}
            </View>
          </View>
        )}
        refreshing={bookingsQuery.isRefetching}
        showsVerticalScrollIndicator={false}
      />

      <View className="px-5 pb-6">
        <PrimaryAction
          label="Sign Out"
          onPress={async () => {
            await signOut();
          }}
          variant="secondary"
        />
      </View>
    </View>
  );
}
