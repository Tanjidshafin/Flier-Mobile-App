import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(undefined),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetBackdrop: ({ children }: { children?: React.ReactNode }) => children ?? null,
  BottomSheetModal: ({ children }: { children?: React.ReactNode }) => children ?? null,
  BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) => children,
  BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => children,
  BottomSheetView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { ScrollView, View } = require('react-native');

  const createAnimationBuilder = () => ({
    duration: () => createAnimationBuilder(),
    delay: () => createAnimationBuilder(),
    springify: () => createAnimationBuilder(),
  });

  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (component: unknown) => component,
      ScrollView,
      View,
    },
    Extrapolation: { CLAMP: 'clamp' },
    FadeInDown: createAnimationBuilder(),
    FadeInUp: createAnimationBuilder(),
    Layout: createAnimationBuilder(),
    interpolate: jest.fn((value: number) => value),
    interpolateColor: jest.fn(() => '#000000'),
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    useAnimatedStyle: (updater: () => unknown) => updater(),
    useSharedValue: (value: unknown) => ({ value }),
    withRepeat: (value: unknown) => value,
    withSequence: (...values: unknown[]) => values[0],
    withSpring: (value: unknown) => value,
    withTiming: (value: unknown) => value,
  };
});

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  Swipeable: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@react-navigation/native', () => ({
  createNavigationContainerRef: () => ({
    isReady: () => false,
    navigate: jest.fn(),
  }),
  DefaultTheme: { colors: {} },
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }: { children: React.ReactNode }) => children,
  useStripe: () => ({
    initPaymentSheet: jest.fn(),
    presentPaymentSheet: jest.fn(),
  }),
}));

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    disconnect: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    on: jest.fn(),
  })),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn().mockResolvedValue({
    assets: [],
    didCancel: true,
  }),
}));

jest.mock('../src/navigation/AppNavigator', () => ({
  AppNavigator: () => {
    const React = require('react');
    const { View } = require('react-native');
    return <View testID="app-navigator" />;
  },
}));

import App from '../App';

test('renders app shell', async () => {
  await ReactTestRenderer.act(() => {
    const tree = ReactTestRenderer.create(<App />);
    expect(tree).toBeTruthy();
  });
});
