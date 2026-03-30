import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { typography } from '../../theme/typography';
import { DraggableSheet } from './DraggableSheet';
import { OtpInput } from './OtpInput';
import { PrimaryButton } from './PrimaryButton';

type Props = {
  error?: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onResend: () => void;
  onSubmit: () => void;
  onValueChange: (value: string) => void;
  phoneNumber: string;
  value: string;
  visible: boolean;
};

export function VerificationSheet({
  error,
  isSubmitting,
  onClose,
  onResend,
  onSubmit,
  onValueChange,
  phoneNumber,
  value,
  visible,
}: Props) {
  return (
    <DraggableSheet visible={visible} onClose={onClose} maxHeightRatio={0.48}>
      <View className="flex-1 pt-[10px]">
        <Text
          style={[
            typography.heading,
            { fontSize: 18, lineHeight: 24, letterSpacing: 0 },
          ]}
          className="text-[#343434]">
          Confirm your number
        </Text>
        <Text
          style={[typography.body, { fontSize: 14, lineHeight: 21 }]}
          className="mt-[14px] text-[#8B8B8B]">
          Enter the code we sent over SMS to {phoneNumber}
        </Text>

        <View className="mt-[18px]">
          <OtpInput error={error} value={value} onChange={onValueChange} />
        </View>

        <View className="mt-[18px] flex-row items-center">
          <Text
            style={[typography.body, { fontSize: 13, lineHeight: 18 }]}
            className="text-[#8F8F8F]">
            Didn&apos;t get an SMS ?
          </Text>
          <Pressable onPress={onResend}>
            <Text
              style={[typography.caption, { fontSize: 13, lineHeight: 18 }]}
              className="ml-[6px] text-[#6D6D6D]">
              Send again
            </Text>
          </Pressable>
        </View>

        <View className="mt-[26px]">
          <PrimaryButton
            disabled={value.length !== 6 || isSubmitting}
            label={isSubmitting ? 'Checking...' : 'Continue'}
            onPress={onSubmit}
          />
        </View>

        <View className="mt-[14px] items-end">
          <Text
            style={[typography.caption, { fontSize: 13, lineHeight: 18 }]}
            className="text-[#747474]">
            Need a help?
          </Text>
        </View>
      </View>
    </DraggableSheet>
  );
}
