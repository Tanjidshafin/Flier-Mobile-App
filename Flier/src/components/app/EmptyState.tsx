import React from 'react';
import { Text, View } from 'react-native';

import AppIcon from '../AppIcon';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ message, title }: Props) {
  return (
    <View className="items-center rounded-[28px] bg-white px-6 py-10">
      <AppIcon color={colors.primary} name="bed-empty" size={28} />
      <Text style={typography.title} className="mt-3 text-center text-brand-text">
        {title}
      </Text>
      <Text style={typography.body} className="mt-2 text-center text-brand-muted">
        {message}
      </Text>
    </View>
  );
}
