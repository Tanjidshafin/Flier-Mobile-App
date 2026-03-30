import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import AppIcon from '../AppIcon';
import { CountryOption } from '../../types/auth';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getDisplayPhoneNumber } from '../../utils/phone';

type Props = {
  country: CountryOption;
  error?: string;
  label: string;
  onChangeText: (value: string) => void;
  onOpenCountrySelector: () => void;
  value: string;
};

export function PhoneField({
  country,
  error,
  label,
  onChangeText,
  onOpenCountrySelector,
  value,
}: Props) {
  return (
    <View className="mb-[13px]">
      <Text
        style={[typography.caption, { fontSize: 14, lineHeight: 20 }]}
        className="mb-[8px] text-[#4B4B4B]">
        {label}
      </Text>
      <View
        className={`h-[46px] flex-row items-center rounded-[14px] border bg-white px-[12px] ${
          error ? 'border-[#F0B6B6]' : 'border-[#DBE1EA]'
        }`}>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenCountrySelector}
          className="mr-[8px] flex-row items-center pr-[8px]">
          <View className="h-[28px] w-[28px] items-center justify-center rounded-full bg-[#F6F1EA]">
            <AppIcon color={colors.primaryDeep} name="flag-variant-outline" size={16} />
          </View>
          <Text
            style={[typography.body, { fontSize: 15, lineHeight: 20 }]}
            className="ml-[6px] text-[#AEAEAE]">
            {country.dialCode}
          </Text>
          <View className="ml-[6px]">
            <AppIcon color="#B4B4B4" name="chevron-down" size={18} />
          </View>
        </Pressable>

        <View className="mr-[10px] h-[18px] w-[1px] bg-[#EBEDF0]" />

        <TextInput
          keyboardType="phone-pad"
          placeholder="ex : 81234567890"
          placeholderTextColor="#B7B7B7"
          style={[
            typography.body,
            {
              flex: 1,
              fontSize: 15,
              lineHeight: 20,
              color: '#3B3B3B',
              paddingVertical: 0,
            },
          ]}
          value={getDisplayPhoneNumber(value)}
          onChangeText={onChangeText}
        />
      </View>
      {error ? (
        <Text
          style={[typography.body, { fontSize: 12, lineHeight: 16 }]}
          className="mt-[6px] text-[#E44D4D]">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
