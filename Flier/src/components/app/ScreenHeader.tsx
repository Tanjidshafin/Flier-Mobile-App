import React from 'react';
import { Text, View } from 'react-native';

import { typography } from '../../theme/typography';
import { ScreenBackButton } from './ScreenBackButton';

type Props = {
  onBackPress?: () => void;
  title?: string;
  rightAccessory?: React.ReactNode;
};

export function ScreenHeader({ onBackPress, rightAccessory, title }: Props) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="min-w-[44px]">
        {onBackPress ? <ScreenBackButton onPress={onBackPress} /> : null}
      </View>
      <View className="mx-4 flex-1">
        {title ? (
          <Text
            numberOfLines={1}
            style={typography.title}
            className="text-center text-brand-text">
            {title}
          </Text>
        ) : null}
      </View>
      <View className="min-w-[44px] items-end">{rightAccessory}</View>
    </View>
  );
}
