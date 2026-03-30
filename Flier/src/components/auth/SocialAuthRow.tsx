import React from 'react';
import { Pressable, Text, View } from 'react-native';

import AppIcon from '../AppIcon';
import { typography } from '../../theme/typography';

function SocialButton({
  backgroundClassName,
  iconColor,
  iconName,
}: {
  backgroundClassName: string;
  iconColor: string;
  iconName: React.ComponentProps<typeof AppIcon>['name'];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[49px] flex-1 items-center justify-center rounded-[14px] ${backgroundClassName}`}>
      <AppIcon color={iconColor} name={iconName} size={20} />
    </Pressable>
  );
}

export function SocialAuthRow() {
  return (
    <View className="mt-[34px]">
      <View className="mb-[37px] flex-row items-center">
        <View className="h-[1px] flex-1 bg-[#ECECEC]" />
        <View className="mx-[14px] h-[24px] min-w-[42px] items-center justify-center rounded-full bg-[#EDF1F5] px-[10px]">
          <Text
            style={[typography.caption, { fontSize: 12, lineHeight: 14 }]}
            className="text-[#B6B8BE]">
            OR
          </Text>
        </View>
        <View className="h-[1px] flex-1 bg-[#ECECEC]" />
      </View>

      <View className="flex-row gap-[12px]">
        <SocialButton
          backgroundClassName="bg-[#F3F3F3]"
          iconColor="#EA4335"
          iconName="google"
        />
        <SocialButton
          backgroundClassName="bg-[#2277EE]"
          iconColor="#FFFFFF"
          iconName="facebook"
        />
        <SocialButton
          backgroundClassName="bg-black"
          iconColor="#FFFFFF"
          iconName="apple"
        />
      </View>
    </View>
  );
}
