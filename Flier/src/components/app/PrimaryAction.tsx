import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export function PrimaryAction({
  label,
  onPress,
  disabled,
  style,
  variant = 'primary',
}: Props) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          backgroundColor: isSecondary ? colors.surface : colors.primary,
          borderColor: isSecondary ? colors.borderMuted : colors.primary,
          borderRadius: 18,
          borderWidth: 1,
          justifyContent: 'center',
          minHeight: 54,
          opacity: disabled ? 0.55 : pressed ? 0.88 : 1,
          paddingHorizontal: 20,
        },
        style,
      ]}>
      <Text
        style={[
          typography.button,
          { color: isSecondary ? colors.textPrimary : colors.surface },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}
