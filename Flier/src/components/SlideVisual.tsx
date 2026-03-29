import React from 'react';
import { Dimensions, Image, ImageSourcePropType, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';

const screenWidth = Dimensions.get('window').width;
const visualWidth = screenWidth - 32;

type SlideVisualProps = {
  image: ImageSourcePropType;
  variant: 'hero' | 'mosaic';
};

export function SlideVisual({ image, variant }: SlideVisualProps) {
  if (variant === 'mosaic') {
    return (
      <View className="mt-4 h-[340px] overflow-hidden rounded-[30px] bg-white">
        <Image
          source={image}
          resizeMode="cover"
          style={{ width: visualWidth, height: 415, marginTop: -8 }}
        />
        <LinearGradient
          colors={[colors.overlaySoft, colors.overlayStrong]}
          locations={[0.55, 1]}
          className="absolute inset-x-0 bottom-0 h-28"
        />
      </View>
    );
  }

  return (
    <View className="mt-4 h-[420px] overflow-hidden rounded-t-[180px] rounded-b-[20px] bg-brand-surfaceMuted">
      <Image
        source={image}
        resizeMode="cover"
        style={{ width: visualWidth, height: 540, marginTop: -34 }}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0)', colors.overlayStrong]}
        locations={[0.52, 1]}
        className="absolute inset-x-0 bottom-0 h-44"
      />
    </View>
  );
}
