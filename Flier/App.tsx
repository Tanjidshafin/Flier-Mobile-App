import './global.css';
import React from 'react';
import { StatusBar, Text, TextInput } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';
import { typography } from './src/theme/typography';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surfaceMuted,
    card: colors.surface,
    border: colors.borderMuted,
    primary: colors.primary,
    text: colors.textPrimary,
  },
};

const defaultTextStyle = {
  fontFamily: typography.fontFamily.regular,
  color: colors.textPrimary,
};

const TextWithDefaults = Text as typeof Text & {
  defaultProps?: Record<string, unknown>;
};
const TextInputWithDefaults = TextInput as typeof TextInput & {
  defaultProps?: Record<string, unknown>;
};

TextWithDefaults.defaultProps = {
  ...(TextWithDefaults.defaultProps ?? {}),
  allowFontScaling: false,
  style: [defaultTextStyle, TextWithDefaults.defaultProps?.style],
};

TextInputWithDefaults.defaultProps = {
  ...(TextInputWithDefaults.defaultProps ?? {}),
  allowFontScaling: false,
  style: [defaultTextStyle, TextInputWithDefaults.defaultProps?.style],
};

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar backgroundColor={colors.surface} barStyle="dark-content" />
            <AppNavigator />
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
