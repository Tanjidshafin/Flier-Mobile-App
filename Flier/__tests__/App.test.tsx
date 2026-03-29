import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  const createAnimationBuilder = () => ({
    duration: () => createAnimationBuilder(),
    delay: () => createAnimationBuilder(),
    springify: () => createAnimationBuilder(),
  });

  return {
    __esModule: true,
    default: {
      View,
    },
    Easing: {
      linear: jest.fn(),
    },
    FadeInDown: createAnimationBuilder(),
    FadeInUp: createAnimationBuilder(),
    Layout: createAnimationBuilder(),
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
}));
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  DefaultTheme: { colors: {} },
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const React = require('react');
    return {
      Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      Screen: ({ component: Component }: { component: React.ComponentType<any> }) => (
        <Component navigation={{ replace: jest.fn() }} route={{ key: 'mock', name: 'Mock' }} />
      ),
    };
  },
}));

import App from '../App';

test('renders onboarding flow shell', async () => {
  await ReactTestRenderer.act(() => {
    const tree = ReactTestRenderer.create(<App />);
    expect(tree).toBeTruthy();
  });
});
