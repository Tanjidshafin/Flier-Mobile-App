import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import { QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';

import { queryClient } from '../shared/queryClient';
import { STRIPE_PUBLISHABLE_KEY } from '../config/env';
import { useUIStore } from '../store/uiStore';
import { AppErrorBoundary } from '../components/app/AppErrorBoundary';
import { OfflineBanner } from '../components/app/OfflineBanner';
import { ToastViewport } from '../components/app/ToastViewport';
import { RealtimeProvider } from '../features/realtime/RealtimeProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const setIsOnline = useUIStore(state => state.setIsOnline);

  React.useEffect(() => {
    return NetInfo.addEventListener(state => {
      const nextOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(nextOnline);
      onlineManager.setOnline(nextOnline);
    });
  }, [setIsOnline]);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StripeProvider merchantIdentifier="merchant.com.flier" publishableKey={STRIPE_PUBLISHABLE_KEY || 'pk_test_mock'}>
          <RealtimeProvider>
            {children}
            <OfflineBanner />
            <ToastViewport />
          </RealtimeProvider>
        </StripeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
