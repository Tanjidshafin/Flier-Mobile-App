import React from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { FeaturedDestination } from '../../types/hotel';
import { typography } from '../../theme/typography';

type Props = {
  destination: FeaturedDestination;
  onPress: () => void;
};

export function DestinationCard({ destination, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="overflow-hidden rounded-[28px]">
      <ImageBackground
        source={{ uri: destination.image }}
        resizeMode="cover"
        style={{ height: 220, justifyContent: 'flex-end' }}>
        <LinearGradient
          colors={['rgba(15,23,42,0.02)', 'rgba(15,23,42,0.75)']}
          style={{ padding: 18 }}>
          <Text style={[typography.title, { color: '#FFFFFF' }]}>
            {destination.locationLabel}
          </Text>
          <Text style={[typography.body, { color: 'rgba(255,255,255,0.84)' }]}>
            {destination.subtitle}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </Pressable>
  );
}
