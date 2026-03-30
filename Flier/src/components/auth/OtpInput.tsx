import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  error?: string;
  onChange: (value: string) => void;
  value: string;
};

export function OtpInput({ error, onChange, value }: Props) {
  const inputRef = React.useRef<TextInput>(null);
  const digits = value.split('');
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(value.length > 0 ? 1 : 0, { duration: 180 });
  }, [progress, value.length]);

  return (
    <View>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <View className="flex-row justify-between">
          {Array.from({ length: 6 }).map((_, index) => (
            <OtpCell
              key={index}
              active={value.length === index}
              filled={Boolean(digits[index])}
              progress={progress}
              value={digits[index] ?? '-'}
            />
          ))}
        </View>
      </Pressable>
      <TextInput
        ref={inputRef}
        keyboardType="number-pad"
        maxLength={6}
        style={{ height: 1, opacity: 0, width: 1 }}
        value={value}
        onChangeText={nextValue => onChange(nextValue.replace(/[^\d]/g, ''))}
      />
      {error ? (
        <Text
          style={[typography.body, { fontSize: 12, lineHeight: 16 }]}
          className="mt-[10px] text-[#E44D4D]">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function OtpCell({
  active,
  filled,
  progress,
  value,
}: {
  active: boolean;
  filled: boolean;
  progress: SharedValue<number>;
  value: string;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [
        active ? '#BFD2F5' : '#D9E0E9',
        filled ? colors.primary : active ? '#BFD2F5' : '#D9E0E9',
      ],
    ),
    transform: [{ scale: withTiming(active ? 1.04 : 1, { duration: 120 }) }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="h-[44px] w-[44px] items-center justify-center rounded-[12px] border bg-white">
      <Text
        style={[typography.caption, { fontSize: 20, lineHeight: 20 }]}
        className={filled ? 'text-[#5D5D5D]' : 'text-[#B9BDC5]'}>
        {value}
      </Text>
    </Animated.View>
  );
}
