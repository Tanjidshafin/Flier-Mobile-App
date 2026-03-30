import React from 'react';
import { Text, View } from 'react-native';

import { typography } from '../../theme/typography';

type Props = {
  title: string;
  subtitle: string;
};

export function AuthHeader({ title, subtitle }: Props) {
  return (
    <View className="mb-9">
      <Text
        style={[
          typography.heading,
          { fontSize: 21, lineHeight: 28, letterSpacing: -0.4 },
        ]}
        className="text-[#343434]">
        {title}
      </Text>
      <Text
        style={[typography.body, { fontSize: 13, lineHeight: 18 }]}
        className="mt-[5px] text-[#9E9E9E]">
        {subtitle}
      </Text>
    </View>
  );
}
