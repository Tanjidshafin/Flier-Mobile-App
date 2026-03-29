import React from 'react';
import { Text, View } from 'react-native';

export function FlierLogo({ light = true }: { light?: boolean }) {
  const textClassName = light ? 'text-white' : 'text-brand-text';
  const ringClassName = light ? 'border-white' : 'border-brand-primary';
  const fillClassName = light ? 'bg-white' : 'bg-brand-primary';
  const accentClassName = light ? 'bg-[#FFD89B]' : 'bg-brand-primarySoft';

  return (
    <View className="flex-row items-center gap-4">
      <View className="relative h-[54px] w-[54px] items-center justify-center">
        <View className={`h-[54px] w-[54px] rounded-full border-[5px] ${ringClassName}`} />
        <View className={`absolute right-[10px] top-[9px] h-[20px] w-[20px] rounded-full ${fillClassName}`} />
        <View className={`absolute right-[14px] top-[15px] h-[4px] w-[4px] rounded-full ${accentClassName}`} />
        <View className={`absolute right-[20px] top-[19px] h-[5px] w-[5px] rounded-full ${accentClassName}`} />
      </View>
      <Text className={`text-[30px] font-extrabold tracking-[-0.4px] ${textClassName}`}>
        Flier
      </Text>
    </View>
  );
}
