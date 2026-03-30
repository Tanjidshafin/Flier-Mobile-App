import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function LoadingCard() {
  const opacity = useSharedValue(0.45);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 700 }), withTiming(0.45, { duration: 700 })),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="overflow-hidden rounded-[28px] bg-white p-4">
      <View className="h-44 rounded-[22px] bg-brand-surfaceMuted" />
      <View className="mt-4 h-5 w-2/3 rounded-full bg-brand-surfaceMuted" />
      <View className="mt-3 h-4 w-1/2 rounded-full bg-brand-surfaceMuted" />
      <View className="mt-5 h-6 w-1/3 rounded-full bg-brand-surfaceMuted" />
    </Animated.View>
  );
}
