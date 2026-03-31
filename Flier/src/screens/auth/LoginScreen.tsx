import React from 'react';
import { Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppIcon from '../../components/AppIcon';
import { ScreenBackButton } from '../../components/app/ScreenBackButton';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthScreenShell } from '../../components/auth/AuthScreenShell';
import { AuthTextField } from '../../components/auth/AuthTextField';
import { PasswordField } from '../../components/auth/PasswordField';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { ApiError } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const signIn = useAuthStore(state => state.signIn);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLogin = React.useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await signIn({
        email: email.trim(),
        password,
      });
      await useWishlistStore.getState().syncGuestWishlist();

      if (route.params?.source === 'booking' || useBookingStore.getState().draft) {
        navigation.replace('BookingCheckout');
        return;
      }

      navigation.replace('MainTabs', { screen: 'Profile' });
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message);
      } else {
        setError('Unable to sign in right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting, navigation, password, route.params?.source, signIn]);

  return (
    <AuthScreenShell
      bottomActionLabel="Register here"
      bottomText="Need an account?"
      topAccessory={<ScreenBackButton onPress={() => navigation.goBack()} />}
      onBottomActionPress={() =>
        navigation.replace('Register', { source: route.params?.source })
      }>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to confirm bookings, sync your wishlist, and manage upcoming stays."
      />
      <AuthTextField
        autoCapitalize="none"
        keyboardType="email-address"
        label="Email"
        leftAccessory={<AppIcon color={colors.textMuted} name="email-outline" size={18} />}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <PasswordField
        label="Password"
        leftAccessory={<AppIcon color={colors.textMuted} name="lock-outline" size={18} />}
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
      />

      {error ? (
        <Text
          style={[typography.body, { fontSize: 12, lineHeight: 16 }]}
          className="mb-[12px] text-[#E44D4D]">
          {error}
        </Text>
      ) : null}

      <PrimaryButton
        disabled={isSubmitting || !email.trim() || !password}
        label={isSubmitting ? 'Signing in...' : 'Sign In'}
        onPress={handleLogin}
      />
    </AuthScreenShell>
  );
}
