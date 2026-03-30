import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  bottomText: string;
  bottomActionLabel: string;
  onBottomActionPress: () => void;
  children: React.ReactNode;
  topAccessory?: React.ReactNode;
  showSocial?: boolean;
};

export function AuthScreenShell({
  bottomActionLabel,
  bottomText,
  children,
  onBottomActionPress,
  topAccessory,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView
          bounces={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: Math.max(insets.bottom, 22),
            paddingTop: insets.top + 12,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-[16px]">
            {topAccessory ? <View className="mb-[16px]">{topAccessory}</View> : null}
            {children}
            <View className="mt-[22px] items-center">
              <Text
                style={[typography.body, { fontSize: 13, lineHeight: 18 }]}
                className="text-[#595959]">
                {bottomText}
                <Text
                  style={[
                    typography.caption,
                    { fontSize: 13, lineHeight: 18, color: colors.primary },
                  ]}
                  onPress={onBottomActionPress}>
                  {' '}
                  {bottomActionLabel}
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
