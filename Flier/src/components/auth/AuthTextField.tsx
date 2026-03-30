import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = TextInputProps & {
  error?: string;
  label: string;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
};

export const AuthTextField = React.forwardRef<TextInput, Props>(
  ({ error, label, leftAccessory, rightAccessory, onBlur, onFocus, ...props }, ref) => {
    const focusProgress = useSharedValue(0);

    const containerStyle = useAnimatedStyle(() => ({
      borderColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        [error ? '#F0B6B6' : '#DBE1EA', error ? '#F0B6B6' : colors.primary],
      ),
      transform: [{ scale: withTiming(focusProgress.value ? 1.01 : 1, { duration: 140 }) }],
    }));

    return (
      <View className="mb-[13px]">
        <Text
          style={[typography.caption, { fontSize: 14, lineHeight: 20 }]}
          className="mb-[8px] text-[#4B4B4B]">
          {label}
        </Text>
        <Animated.View
          style={containerStyle}
          className="h-[46px] flex-row items-center rounded-[14px] border bg-white px-[14px]">
          {leftAccessory ? <>{leftAccessory}</> : null}
          <TextInput
            ref={ref}
            placeholderTextColor="#B7B7B7"
            style={[
              typography.body,
              {
                flex: 1,
                fontSize: 15,
                lineHeight: 20,
                color: '#3B3B3B',
                marginLeft: leftAccessory ? 10 : 0,
                paddingVertical: 0,
              },
            ]}
            onFocus={event => {
              focusProgress.value = withTiming(1, { duration: 160 });
              onFocus?.(event);
            }}
            onBlur={event => {
              focusProgress.value = withTiming(0, { duration: 160 });
              onBlur?.(event);
            }}
            {...props}
          />
          {rightAccessory}
        </Animated.View>
        {error ? (
          <Text
            style={[typography.body, { fontSize: 12, lineHeight: 16 }]}
            className="mt-[6px] text-[#E44D4D]">
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

AuthTextField.displayName = 'AuthTextField';
