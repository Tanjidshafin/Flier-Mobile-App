import React from 'react';
import { Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlierLogo } from '../components/FlierLogo';
import { OnboardingButton } from '../components/OnboardingControls';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'WelcomePlaceholder'>;

export function WelcomePlaceholderScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white px-6" style={{ paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 24) }}>
      <View className="mt-10 items-center">
        <FlierLogo light={false} />
      </View>
      <View className="flex-1 items-center justify-center">
        <View className="w-full rounded-[32px] bg-brand-surfaceMuted px-6 py-10">
          <Text className="text-center text-[28px] font-extrabold leading-[36px] text-brand-text">
            Welcome to Flier
          </Text>
          <Text className="mt-4 text-center text-[15px] leading-[24px] text-brand-muted">
            The onboarding flow is ready. This screen is the handoff point for your next app feature, such as auth or home discovery.
          </Text>
        </View>
      </View>
      <OnboardingButton label="Replay Tour" fullWidth onPress={() => navigation.replace('Onboarding')} />
    </View>
  );
}
