import React from 'react';
import { Text, View } from 'react-native';

import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export function OfflineBanner() {
  const isOnline = useUIStore(state => state.isOnline);

  if (isOnline) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: colors.error,
        left: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        position: 'absolute',
        right: 16,
        top: 12,
        zIndex: 60,
      }}
      className="rounded-[20px]">
      <Text style={[typography.caption, { color: '#FFFFFF' }]}>
        You are offline. Some actions will retry when the network returns.
      </Text>
    </View>
  );
}
