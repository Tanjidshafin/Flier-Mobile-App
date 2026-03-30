import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type PaginationDotsProps = {
  activeIndex: number;
  total: number;
};

export function PaginationDots({ activeIndex, total }: PaginationDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={index} active={index === activeIndex} />
      ))}
    </View>
  );
}

function Dot({ active }: { active: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(active ? 22 : 8),
    backgroundColor: withTiming(active ? colors.dotActive : colors.dotInactive),
    opacity: withTiming(active ? 1 : 0.9),
    transform: [{ scale: withSpring(active ? 1 : 0.95) }],
  }));

  return (
    <Animated.View
      accessibilityRole="none"
      style={animatedStyle}
      className="h-2 rounded-full"
    />
  );
}

type OnboardingButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  testID?: string;
};

export function OnboardingButton({
  label,
  variant = 'primary',
  onPress,
  fullWidth,
  icon,
  testID,
}: OnboardingButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      className={`items-center justify-center rounded-[18px] ${
        fullWidth ? 'w-full' : ''
      } ${isPrimary ? 'bg-brand-primary' : 'bg-white border border-brand-border'}`}
      style={{
        minHeight: 56,
        paddingHorizontal: isPrimary ? 24 : 20,
        shadowColor: isPrimary ? colors.primary : 'transparent',
        shadowOpacity: isPrimary ? 0.14 : 0,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: isPrimary ? 4 : 0,
      }}>
      <View className="flex-row items-center justify-center gap-3">
        <Text
          style={[
            typography.button,
            { color: isPrimary ? colors.surface : colors.textPrimary },
          ]}>
          {label}
        </Text>
        {icon}
      </View>
    </Pressable>
  );
}

export function ArrowIcon() {
  return (
    <View className="relative h-4 w-6 items-start justify-center">
      <View className="h-[2px] w-5 rounded-full bg-white" />
      <View className="absolute right-0 top-[3px] h-[2px] w-2 rotate-45 rounded-full bg-white" />
      <View className="absolute right-0 bottom-[3px] h-[2px] w-2 -rotate-45 rounded-full bg-white" />
    </View>
  );
}
