import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../app/ScreenHeader';

type Props = {
  children: React.ReactNode;
  onBackPress?: () => void;
  rightAccessory?: React.ReactNode;
  title: string;
};

export function AdminScreenLayout({
  children,
  onBackPress,
  rightAccessory,
  title,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-brand-surfaceMuted" style={{ paddingTop: insets.top + 12 }}>
      <View className="px-5">
        <ScreenHeader
          onBackPress={onBackPress}
          rightAccessory={rightAccessory}
          title={title}
        />
      </View>
      {children}
    </View>
  );
}
