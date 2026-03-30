import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import AppIcon from '../AppIcon';
import { HotelSummary } from '../../types/hotel';
import { formatCurrency } from '../../utils/format';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = {
  hotel: HotelSummary;
  saved?: boolean;
  onPress: () => void;
  onToggleSaved?: () => void;
  compact?: boolean;
};

function MetaItem({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
}) {
  return (
    <View className="flex-row items-center">
      <AppIcon color={colors.textSecondary} name={icon} size={14} />
      <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 6 }]}>
        {label}
      </Text>
    </View>
  );
}

export function HotelCard({
  compact = false,
  hotel,
  onPress,
  onToggleSaved,
  saved,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: 28,
        opacity: pressed ? 0.95 : 1,
        overflow: 'hidden',
        shadowColor: '#111827',
        shadowOffset: { height: 10, width: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      })}>
      <View>
        <Image
          source={{ uri: hotel.image }}
          resizeMode="cover"
          style={{ height: compact ? 160 : 220, width: '100%' }}
        />
        {onToggleSaved ? (
          <Pressable
            className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white/90"
            onPress={event => {
              event.stopPropagation();
              onToggleSaved();
            }}>
            <AppIcon
              color={saved ? '#F43F5E' : colors.textPrimary}
              name={saved ? 'heart' : 'heart-outline'}
              size={20}
            />
          </Pressable>
        ) : null}
        {hotel.tag ? (
          <View className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1.5">
            <Text style={typography.caption} className="text-white">
              {hotel.tag}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="gap-2 px-4 py-4">
        <View className="flex-row items-start justify-between">
          <Text
            numberOfLines={2}
            style={[typography.title, { flex: 1, fontSize: compact ? 18 : 20 }]}>
            {hotel.name}
          </Text>
          <View className="ml-3 flex-row items-center">
            <AppIcon color={colors.primary} name="star" size={18} />
            <Text style={[typography.body, { color: colors.textPrimary, marginLeft: 4 }]}>
              {hotel.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <AppIcon color={colors.textMuted} name="map-marker-outline" size={15} />
          <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 6 }]}>
            {hotel.locationLabel}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-3">
          <MetaItem icon="bed-queen-outline" label={`${hotel.rooms} rooms`} />
          <MetaItem icon="shower" label={`${hotel.baths} baths`} />
          <MetaItem icon="ruler-square" label={`${hotel.squareMeters} m²`} />
        </View>
        <View className="mt-1 flex-row items-end justify-between">
          <View>
            <Text style={[typography.title, { color: colors.textPrimary }]}>
              {formatCurrency(hotel.price.amount, hotel.price.currency)}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              per night
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={[typography.body, { color: colors.textSecondary, maxWidth: 140 }]}>
            {hotel.shortDescription}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
