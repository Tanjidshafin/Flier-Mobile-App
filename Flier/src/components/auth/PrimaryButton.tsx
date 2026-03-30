import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({ disabled, label, onPress }: Props) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: colors.primary,
    opacity: disabled ? 0.6 : 1,
    transform: [{ scale: withSpring(pressed.value ? 0.98 : 1) }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = 1;
      }}
      onPressOut={() => {
        pressed.value = 0;
      }}
      style={animatedStyle}
      className="h-[56px] items-center justify-center rounded-[16px]"
      android_ripple={{ color: 'rgba(255,255,255,0.14)' }}>
      <Text
        style={[typography.button, { fontSize: 15.5, lineHeight: 20, letterSpacing: 0 }]}
        className="text-white">
        {label}
      </Text>
    </AnimatedPressable>
  );
}
