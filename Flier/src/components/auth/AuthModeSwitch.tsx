import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthIdentifierType } from '../../types/auth';
import { typography } from '../../theme/typography';

type Props = {
  mode: AuthIdentifierType;
  onChange: (mode: AuthIdentifierType) => void;
};

const options: { label: string; value: AuthIdentifierType }[] = [
  { label: 'Username', value: 'username' },
  { label: 'Phone Number', value: 'phoneNumber' },
];

export function AuthModeSwitch({ mode, onChange }: Props) {
  return (
    <View className="mb-11 rounded-[23px] bg-[#EDF1F8] p-[4px]">
      <View className="flex-row">
        {options.map(option => {
          const isActive = option.value === mode;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => onChange(option.value)}
              className={`h-[44px] flex-1 items-center justify-center rounded-[21px] ${
                isActive ? 'bg-[#2F2F2F]' : 'bg-transparent'
              }`}>
              <Text
                style={[typography.caption, { fontSize: 13.5, lineHeight: 18 }]}
                className={isActive ? 'text-white' : 'text-[#4D4D4D]'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
