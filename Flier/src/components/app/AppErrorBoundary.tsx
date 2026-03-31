import React from 'react';
import { Text, View } from 'react-native';

import { PrimaryAction } from './PrimaryAction';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) {
      console.error(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-brand-surfaceMuted px-6">
          <View className="w-full rounded-[28px] bg-white p-6">
            <Text style={typography.heading} className="text-brand-text">
              Something went wrong
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12 }]}>
              The app hit an unexpected error. Reload and continue where you left off.
            </Text>
            <PrimaryAction
              label="Reload app"
              onPress={() => this.setState({ hasError: false })}
              style={{ marginTop: 18 }}
            />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
