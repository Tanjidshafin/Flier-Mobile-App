import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

import { AMENITY_OPTIONS, PRICE_PRESETS, RATING_OPTIONS, SORT_OPTIONS } from '../../constants/hotel';
import { SearchFilters } from '../../types/hotel';
import { typography } from '../../theme/typography';
import { PrimaryAction } from './PrimaryAction';

type Props = {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
};

function Chip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className={`rounded-full border px-4 py-2 ${active ? 'border-brand-primary bg-brand-primary' : 'border-brand-border bg-white'}`}
      onPress={onPress}>
      <Text
        style={[
          typography.body,
          {
            color: active ? '#FFFFFF' : '#1F2937',
            fontSize: 13,
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function FilterSheet({ bottomSheetRef, filters, onChange }: Props) {
  return (
    <BottomSheetModal
      backdropComponent={props => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
      enableDynamicSizing={false}
      index={0}
      ref={bottomSheetRef}
      snapPoints={['78%']}>
      <BottomSheetScrollView contentContainerStyle={{ gap: 22, padding: 20, paddingBottom: 28 }}>
        <View>
          <Text style={typography.title} className="text-brand-text">
            Refine your results
          </Text>
          <Text style={typography.body} className="mt-2 text-brand-muted">
            Adjust pricing, ratings, and amenities in real time.
          </Text>
        </View>

        <View className="gap-3">
          <Text style={typography.title} className="text-[16px] text-brand-text">
            Sort by
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {SORT_OPTIONS.map(option => (
              <Chip
                active={filters.sortBy === option.value}
                key={option.value}
                label={option.label}
                onPress={() => onChange({ sortBy: option.value })}
              />
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text style={typography.title} className="text-[16px] text-brand-text">
            Price range
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {PRICE_PRESETS.map(preset => (
              <Chip
                active={
                  filters.minPrice === preset.minPrice &&
                  filters.maxPrice === preset.maxPrice
                }
                key={preset.label}
                label={preset.label}
                onPress={() =>
                  onChange({
                    maxPrice: preset.maxPrice,
                    minPrice: preset.minPrice,
                  })
                }
              />
            ))}
            <Chip
              active={!filters.minPrice && !filters.maxPrice}
              label="Any"
              onPress={() => onChange({ maxPrice: undefined, minPrice: undefined })}
            />
          </View>
        </View>

        <View className="gap-3">
          <Text style={typography.title} className="text-[16px] text-brand-text">
            Minimum rating
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {RATING_OPTIONS.map(rating => (
              <Chip
                active={filters.minRating === rating}
                key={rating}
                label={`${rating}+`}
                onPress={() => onChange({ minRating: rating })}
              />
            ))}
            <Chip
              active={!filters.minRating}
              label="Any"
              onPress={() => onChange({ minRating: undefined })}
            />
          </View>
        </View>

        <View className="gap-3">
          <Text style={typography.title} className="text-[16px] text-brand-text">
            Amenities
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {AMENITY_OPTIONS.map(amenity => {
              const active = filters.amenities.includes(amenity);

              return (
                <Chip
                  active={active}
                  key={amenity}
                  label={amenity}
                  onPress={() =>
                    onChange({
                      amenities: active
                        ? filters.amenities.filter(item => item !== amenity)
                        : [...filters.amenities, amenity],
                    })
                  }
                />
              );
            })}
          </View>
        </View>

        <PrimaryAction
          label="Done"
          onPress={() => {
            bottomSheetRef.current?.dismiss();
          }}
        />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
