import React from 'react';
import { Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Calendar, DateData } from 'react-native-calendars';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  addDays,
  compareISODateStrings,
  getDateRange,
  parseISODateString,
  toISODateString,
} from '../../utils/date';
import { PrimaryAction } from './PrimaryAction';

type Props = {
  initialCheckIn: string;
  initialCheckOut: string;
  onConfirm: (checkIn: string, checkOut: string) => void;
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
};

function buildMarkedDates(checkIn?: string, checkOut?: string) {
  if (!checkIn) {
    return {};
  }

  const days = getDateRange(checkIn, checkOut || checkIn);

  return days.reduce<Record<string, object>>((accumulator, key, index) => {
    accumulator[key] = {
      color: colors.primary,
      endingDay: index === days.length - 1,
      startingDay: index === 0,
      textColor: '#FFFFFF',
    };
    return accumulator;
  }, {});
}

export function DateRangePickerSheet({
  bottomSheetRef,
  initialCheckIn,
  initialCheckOut,
  onConfirm,
}: Props) {
  const [checkIn, setCheckIn] = React.useState(initialCheckIn);
  const [checkOut, setCheckOut] = React.useState(initialCheckOut);

  React.useEffect(() => {
    setCheckIn(initialCheckIn);
    setCheckOut(initialCheckOut);
  }, [initialCheckIn, initialCheckOut]);

  const handleSelectDate = React.useCallback(
    (day: DateData) => {
      if (!checkIn || (checkIn && checkOut)) {
        setCheckIn(day.dateString);
        setCheckOut('');
        return;
      }

      const comparison = compareISODateStrings(day.dateString, checkIn);

      if (comparison <= 0) {
        setCheckIn(day.dateString);
        setCheckOut(toISODateString(addDays(parseISODateString(day.dateString), 2)));
        return;
      }

      if (comparison > 0) {
        setCheckOut(day.dateString);
      }
    },
    [checkIn, checkOut],
  );

  return (
    <BottomSheetModal
      backdropComponent={props => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
      enableDynamicSizing={false}
      index={0}
      ref={bottomSheetRef}
      snapPoints={['78%']}>
      <BottomSheetView className="flex-1 px-5 pb-8">
        <Text style={typography.title} className="text-brand-text">
          Choose your stay dates
        </Text>
        <Text style={typography.body} className="mt-2 text-brand-muted">
          Pick check-in and check-out for your next stay.
        </Text>
        <View className="mt-5 overflow-hidden rounded-[24px] bg-brand-surfaceMuted p-2">
          <Calendar
            enableSwipeMonths
            markingType="period"
            minDate={toISODateString(addDays(new Date(), 1))}
            markedDates={buildMarkedDates(checkIn, checkOut)}
            onDayPress={handleSelectDate}
            theme={{
              arrowColor: colors.primary,
              monthTextColor: colors.textPrimary,
              textDayFontFamily: typography.fontFamily.medium,
              textMonthFontFamily: typography.fontFamily.bold,
            }}
          />
        </View>
        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-[20px] bg-brand-surfaceMuted px-4 py-4">
            <Text style={typography.caption} className="text-brand-muted">
              Check-in
            </Text>
            <Text style={[typography.title, { fontSize: 16 }]} className="mt-1 text-brand-text">
              {checkIn || '--'}
            </Text>
          </View>
          <View className="flex-1 rounded-[20px] bg-brand-surfaceMuted px-4 py-4">
            <Text style={typography.caption} className="text-brand-muted">
              Check-out
            </Text>
            <Text style={[typography.title, { fontSize: 16 }]} className="mt-1 text-brand-text">
              {checkOut || '--'}
            </Text>
          </View>
        </View>
        <PrimaryAction
          label="Apply Dates"
          onPress={() => {
            if (checkIn && checkOut) {
              onConfirm(checkIn, checkOut);
              bottomSheetRef.current?.dismiss();
            }
          }}
          style={{ marginTop: 20 }}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}
