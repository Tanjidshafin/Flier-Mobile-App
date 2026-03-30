import React from 'react';
import { Pressable } from 'react-native';

import AppIcon from '../AppIcon';
import { colors } from '../../theme/colors';

type Props = {
  onPress: () => void;
  variant?: 'light' | 'surface';
};

export function ScreenBackButton({ onPress, variant = 'surface' }: Props) {
  const isLight = variant === 'light';

  return (
    <Pressable
      accessibilityRole="button"
      className="h-11 w-11 items-center justify-center rounded-full"
      onPress={onPress}
      style={{
        backgroundColor: isLight ? 'rgba(255, 255, 255, 0.88)' : colors.surface,
        borderColor: isLight ? 'transparent' : colors.borderMuted,
        borderWidth: isLight ? 0 : 1,
      }}>
      <AppIcon
        color={colors.textPrimary}
        name="arrow-left"
        size={22}
      />
    </Pressable>
  );
}
