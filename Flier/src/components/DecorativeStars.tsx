import React from 'react';
import { View } from 'react-native';

type DecorativeStarsProps = {
  light?: boolean;
};

function Star({ className }: { className: string }) {
  return (
    <View className={`absolute items-center justify-center ${className}`}>
      <View className="absolute h-full w-[26%] rounded-full bg-white/45" />
      <View className="absolute h-[26%] w-full rounded-full bg-white/45" />
    </View>
  );
}

export function DecorativeStars({ light = true }: DecorativeStarsProps) {
  const opacityClass = light ? '' : 'opacity-60';

  return (
    <View pointerEvents="none" className={`absolute inset-0 ${opacityClass}`}>
      <Star className="bottom-28 left-2 h-16 w-16 rotate-12" />
      <Star className="bottom-44 left-20 h-8 w-8 -rotate-12" />
      <Star className="bottom-20 left-24 h-20 w-20 -rotate-6" />
      <Star className="bottom-14 left-40 h-10 w-10 rotate-12" />
      <Star className="bottom-24 left-56 h-9 w-9 -rotate-12" />
    </View>
  );
}
