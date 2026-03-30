import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function SectionHeader({ actionLabel, onPressAction, title }: Props) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Text style={typography.title} className="text-brand-text">
        {title}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onPressAction}>
          <Text
            style={[typography.body, { color: colors.secondary, fontSize: 13 }]}
            className="text-brand-accent">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
