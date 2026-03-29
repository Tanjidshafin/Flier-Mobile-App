import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DecorativeStars } from '../components/DecorativeStars';
import { FlierLogo } from '../components/FlierLogo';
import { SplashLoader } from '../components/SplashLoader';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 bg-brand-primary">
      <View className="flex-1 px-6 pt-16">
        <DecorativeStars />
        <Animated.View
          entering={FadeInDown.duration(650)}
          className="flex-1 items-center justify-center">
          <FlierLogo />
          <Text className="mt-4 text-center text-[16px] font-semibold text-white/75">
            Your stay, elevated.
          </Text>
        </Animated.View>
        <Animated.View
          entering={FadeInUp.delay(220).duration(700)}
          className="items-center pb-20">
          <SplashLoader />
        </Animated.View>
      </View>
    </View>
  );
}
