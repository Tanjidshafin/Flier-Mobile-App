import React from 'react';
import { Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { PrimaryAction } from '../app/PrimaryAction';

type Props = {
  onNext: () => void;
  onPrevious: () => void;
  page: number;
  totalPages: number;
};

export function AdminPaginationControls({
  onNext,
  onPrevious,
  page,
  totalPages,
}: Props) {
  return (
    <View className="mt-4 flex-row items-center justify-between rounded-[24px] bg-white px-4 py-4">
      <View style={{ width: 110 }}>
        <PrimaryAction
          disabled={page <= 1}
          label="Previous"
          onPress={onPrevious}
          variant="secondary"
        />
      </View>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>
        Page {page} of {totalPages}
      </Text>
      <View style={{ width: 110 }}>
        <PrimaryAction
          disabled={page >= totalPages}
          label="Next"
          onPress={onNext}
        />
      </View>
    </View>
  );
}
