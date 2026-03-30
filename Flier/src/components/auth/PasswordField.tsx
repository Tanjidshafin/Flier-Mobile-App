import React from 'react';
import { Pressable } from 'react-native';

import AppIcon from '../AppIcon';
import { colors } from '../../theme/colors';
import { AuthTextField } from './AuthTextField';

type Props = React.ComponentProps<typeof AuthTextField>;

export function PasswordField(props: Props) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <AuthTextField
      {...props}
      secureTextEntry={!isVisible}
      rightAccessory={
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsVisible(current => !current)}
          hitSlop={10}>
          <AppIcon
            color={colors.textMuted}
            name={isVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
          />
        </Pressable>
      }
    />
  );
}
