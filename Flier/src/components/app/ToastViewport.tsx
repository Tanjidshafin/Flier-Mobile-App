import React from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from 'react-native-reanimated';

import { ToastItem, useUIStore } from '../../store/uiStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

function ToastCard({ toast }: { toast: ToastItem }) {
  const dismissToast = useUIStore(state => state.dismissToast);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dismissToast(toast.id);
    }, 3200);

    return () => clearTimeout(timer);
  }, [dismissToast, toast.id]);

  const accent =
    toast.tone === 'success'
      ? colors.success
      : toast.tone === 'error'
        ? colors.error
        : colors.secondary;

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutUp.duration(180)}
      layout={Layout.springify()}
      style={{
        backgroundColor: colors.surface,
        borderColor: accent,
        borderWidth: 1,
        shadowColor: colors.shadow,
        shadowOffset: { height: 10, width: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
      }}
      className="rounded-[22px] px-4 py-3">
      <Text style={[typography.caption, { color: accent }]}>{toast.title}</Text>
      <Text style={[typography.body, { color: colors.textPrimary, marginTop: 4 }]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

export function ToastViewport() {
  const toasts = useUIStore(state => state.toasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{ left: 16, position: 'absolute', right: 16, top: 56, zIndex: 80 }}>
      <View className="gap-3">
        {toasts.slice(-3).map(toast => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </View>
    </View>
  );
}
