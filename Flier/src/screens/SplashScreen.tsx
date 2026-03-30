import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DecorativeStars } from '../components/DecorativeStars';
import { FlierLogo } from '../components/FlierLogo';
import { SplashLoader } from '../components/SplashLoader';
import { useAuthStore } from '../store/authStore';
import { useBootstrapStore } from '../store/bootstrapStore';
import { useWishlistStore } from '../store/wishlistStore';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const hasCompletedOnboarding = useBootstrapStore(
    state => state.hasCompletedOnboarding,
  );
  const bootstrapHydrated = useBootstrapStore(state => state.hasHydrated);
  const authHydrated = useAuthStore(state => state.hasHydrated);
  const wishlistHydrated = useWishlistStore(state => state.hasHydrated);
  const hydrateSession = useAuthStore(state => state.hydrateSession);

  React.useEffect(() => {
    if (!bootstrapHydrated || !authHydrated || !wishlistHydrated) {
      return;
    }

    const timer = setTimeout(async () => {
      await hydrateSession();
      navigation.replace(hasCompletedOnboarding ? 'MainTabs' : 'Onboarding');
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    authHydrated,
    bootstrapHydrated,
    hasCompletedOnboarding,
    hydrateSession,
    navigation,
    wishlistHydrated,
  ]);

  return (
    <View className="flex-1 bg-brand-primary">
      <View className="flex-1 px-6 pt-16">
        <DecorativeStars />
        <Animated.View
          entering={FadeInDown.duration(650)}
          className="flex-1 items-center justify-center">
          <FlierLogo />
          <Text
            style={typography.caption}
            className="mt-4 text-center text-white/75">
            Your stay, elevated.
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeInUp.delay(220).duration(700)}
          className="items-center pb-40">
          <SplashLoader />
        </Animated.View>
      </View>
    </View>
  );
}
