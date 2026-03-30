import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';

type SlideVisualProps = {
  image: ImageSourcePropType;
  variant: 'hero' | 'mosaic';
  height: number;
  width: number;
};

export function SlideVisual({ image, variant, height, width }: SlideVisualProps) {
  if (variant === 'mosaic') {
    return (
      <View
        className="mt-4 overflow-hidden rounded-[30px] bg-brand-surface"
        style={{ height, width }}>
        <Image
          source={image}
          resizeMode="cover"
          style={{ width, height: height * 1.14, marginTop: -2 }}
        />
        <LinearGradient
          colors={[colors.overlaySoft, colors.overlayStrong]}
          locations={[0.5, 1]}
          className="absolute inset-x-0 bottom-0 h-24"
        />
      </View>
    );
  }

  return (
    <View
      className="mt-4 overflow-hidden rounded-b-[24px] rounded-t-[180px] bg-brand-surface"
      style={{ height, width }}>
      <Image
        source={image}
        resizeMode="cover"
        style={{ width, height: height * 1.22, marginTop: -10 }}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0)', colors.overlayStrong]}
        locations={[0.56, 1]}
        className="absolute inset-x-0 bottom-0 h-40"
      />
    </View>
  );
}
