import React from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

type Props = {
  children: React.ReactNode;
  maxHeightRatio?: number;
  onClose: () => void;
  visible: boolean;
};

const DEFAULT_MAX_HEIGHT_RATIO = 0.58;

export function DraggableSheet({
  children,
  maxHeightRatio = DEFAULT_MAX_HEIGHT_RATIO,
  onClose,
  visible,
}: Props) {
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);
  const hasPresentedRef = React.useRef(false);
  const snapPoints = React.useMemo(
    () => [`${Math.round(maxHeightRatio * 100)}%`],
    [maxHeightRatio],
  );

  React.useEffect(() => {
    if (visible) {
      hasPresentedRef.current = true;
      bottomSheetRef.current?.present();
      return;
    }

    bottomSheetRef.current?.dismiss();
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={() => {
        if (hasPresentedRef.current && visible) {
          onClose();
        }
      }}
      backdropComponent={props => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
      )}>
      <BottomSheetView className="flex-1 px-[16px] pb-[12px]">
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
