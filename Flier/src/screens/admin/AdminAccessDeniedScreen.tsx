import React from 'react';
import { Text, View } from 'react-native';

import AppIcon from '../../components/AppIcon';
import { PrimaryAction } from '../../components/app/PrimaryAction';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  onReturn: () => void;
};

export function AdminAccessDeniedScreen({ onReturn }: Props) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onReturn();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onReturn]);

  return (
    <View className="flex-1 items-center justify-center bg-brand-surfaceMuted px-6">
      <View className="w-full rounded-[32px] bg-white p-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-surfaceElevated">
          <AppIcon color={colors.error} name="shield-check-outline" size={30} />
        </View>
        <Text style={typography.heading} className="mt-5 text-brand-text">
          Admin access required
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 10 }]}>
          This area is only available to admin accounts. Returning you to the main app now.
        </Text>
        <PrimaryAction label="Go to Profile" onPress={onReturn} style={{ marginTop: 22 }} />
      </View>
    </View>
  );
}
