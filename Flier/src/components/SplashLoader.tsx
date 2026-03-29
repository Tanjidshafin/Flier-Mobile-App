import React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';

export function SplashLoader() {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0.9);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 650 }),
        withTiming(0.9, { duration: 650 }),
      ),
      -1,
      false,
    );
  }, [pulse, rotation]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: pulse.value }],
  }));

  return (
    <View className="items-center justify-center">
      <View
        className="h-[54px] w-[54px] rounded-full border-[3px]"
        style={{ borderColor: colors.loaderTrack }}
      />
      <Animated.View
        className="absolute h-[54px] w-[54px] rounded-full border-[4px] border-transparent"
        style={[
          ringStyle,
          {
            borderTopColor: '#FFFFFF',
            borderRightColor: colors.loaderRing,
          },
        ]}
      />
    </View>
  );
}
