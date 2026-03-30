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
import { ApiError } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation, route }: Props) {
  const signUp = useAuthStore(state => state.signUp);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRegister = React.useCallback(async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await signUp({
        email: email.trim(),
        fullName: fullName.trim(),
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
        setError('Unable to create your account right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, email, fullName, navigation, password, route.params?.source, signUp]);

  return (
    <AuthScreenShell
      bottomActionLabel="Login here"
      bottomText="Already have an account?"
      topAccessory={<ScreenBackButton onPress={() => navigation.goBack()} />}
      onBottomActionPress={() =>
        navigation.replace('Login', { source: route.params?.source })
      }>
      <AuthHeader
        title="Create your account"
        subtitle="Save favorites now and unlock reserve-now booking when you are ready."
      />
      <AuthTextField
        autoCapitalize="words"
        label="Full name"
        leftAccessory={<AppIcon color={colors.textMuted} name="account-outline" size={18} />}
        placeholder="Sadik Rahman"
        value={fullName}
        onChangeText={setFullName}
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
      <PasswordField
        label="Confirm password"
        leftAccessory={<AppIcon color={colors.textMuted} name="shield-check-outline" size={18} />}
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {error ? (
        <Text
          style={[typography.body, { fontSize: 12, lineHeight: 16 }]}
          className="mb-[12px] text-[#E44D4D]">
          {error}
        </Text>
      ) : null}

      <PrimaryButton
        disabled={!fullName.trim() || !email.trim() || !password || !confirmPassword}
        label={isSubmitting ? 'Creating account...' : 'Create Account'}
        onPress={handleRegister}
      />
    </AuthScreenShell>
  );
}
