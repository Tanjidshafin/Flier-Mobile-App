import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { typography } from '../../theme/typography';
import { PrimaryAction } from './PrimaryAction';

type Props = {
  adults: number;
  children: number;
  rooms: number;
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  onConfirm: (adults: number, children: number, rooms: number) => void;
};

function CounterRow({
  label,
  value,
  onChange,
  minimum = 0,
}: {
  label: string;
  value: number;
  onChange: (nextValue: number) => void;
  minimum?: number;
}) {
  return (
    <View className="flex-row items-center justify-between rounded-[24px] bg-brand-surfaceMuted px-4 py-4">
      <Text style={typography.title} className="text-brand-text">
        {label}
      </Text>
      <View className="flex-row items-center gap-4">
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
          onPress={() => onChange(Math.max(value - 1, minimum))}>
          <Text style={typography.title}>-</Text>
        </Pressable>
        <Text style={typography.title} className="w-6 text-center text-brand-text">
          {value}
        </Text>
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
          onPress={() => onChange(value + 1)}>
          <Text style={typography.title}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function GuestPickerSheet({
  adults,
  bottomSheetRef,
  children,
  onConfirm,
  rooms,
}: Props) {
  const [localAdults, setLocalAdults] = React.useState(adults);
  const [localChildren, setLocalChildren] = React.useState(children);
  const [localRooms, setLocalRooms] = React.useState(rooms);

  React.useEffect(() => {
    setLocalAdults(adults);
    setLocalChildren(children);
    setLocalRooms(rooms);
  }, [adults, children, rooms]);

  return (
    <BottomSheetModal
      backdropComponent={props => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
      enableDynamicSizing={false}
      index={0}
      ref={bottomSheetRef}
      snapPoints={['48%']}>
      <BottomSheetView className="flex-1 gap-4 px-5 pb-8">
        <Text style={typography.title} className="text-brand-text">
          Travelers and rooms
        </Text>
        <CounterRow label="Adults" minimum={1} onChange={setLocalAdults} value={localAdults} />
        <CounterRow label="Children" onChange={setLocalChildren} value={localChildren} />
        <CounterRow label="Rooms" minimum={1} onChange={setLocalRooms} value={localRooms} />
        <PrimaryAction
          label="Apply Guests"
          onPress={() => {
            onConfirm(localAdults, localChildren, localRooms);
            bottomSheetRef.current?.dismiss();
          }}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}
