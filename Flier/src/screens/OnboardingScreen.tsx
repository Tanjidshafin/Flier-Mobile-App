import React from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ArrowIcon,
  OnboardingButton,
  PaginationDots,
} from '../components/OnboardingControls';
import { SlideVisual } from '../components/SlideVisual';
import { onboardingSlides } from '../data/onboardingSlides';
import { RootStackParamList } from '../types/navigation';
import { OnboardingSlide } from '../types/onboarding';

const { width: screenWidth } = Dimensions.get('window');
const horizontalPadding = 16;
const cardWidth = screenWidth - horizontalPadding * 2;

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = React.useRef<FlatList<OnboardingSlide>>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const activeSlide = onboardingSlides[activeIndex];
  const isLastSlide = activeIndex === onboardingSlides.length - 1;

  const scrollToIndex = React.useCallback((index: number) => {
    listRef.current?.scrollToOffset({ offset: index * cardWidth, animated: true });
    setActiveIndex(index);
  }, []);

  const handleMomentumEnd = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
      setActiveIndex(nextIndex);
    },
    [],
  );

  const handleSkip = React.useCallback(() => {
    scrollToIndex(onboardingSlides.length - 1);
  }, [scrollToIndex]);

  const handleNext = React.useCallback(() => {
    if (isLastSlide) {
      navigation.replace('WelcomePlaceholder');
      return;
    }

    scrollToIndex(activeIndex + 1);
  }, [activeIndex, isLastSlide, navigation, scrollToIndex]);

  const renderItem = ({ item }: ListRenderItemInfo<OnboardingSlide>) => (
    <View style={{ width: cardWidth }}>
      <SlideVisual image={item.image} variant={item.variant} />
    </View>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top + 6 }}>
      <View className="flex-1 px-4">
        <FlatList
          ref={listRef}
          data={onboardingSlides}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          snapToInterval={cardWidth}
          decelerationRate="fast"
          onMomentumScrollEnd={handleMomentumEnd}
          testID="onboarding-carousel"
        />

        <Animated.View layout={Layout.springify()} className="flex-1 px-4 pb-6 pt-8">
          <Animated.View entering={FadeInDown.duration(300)} key={activeSlide.id}>
            <Text className="text-center text-[23px] font-extrabold leading-[32px] text-brand-text">
              {activeSlide.title}
            </Text>
            <Text className="mt-3 text-center text-[14px] font-medium leading-[22px] text-brand-muted">
              {activeSlide.description}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(80).duration(320)}
            key={`${activeSlide.id}-dots`}
            className="mt-7 items-center justify-center">
            <PaginationDots activeIndex={activeIndex} total={onboardingSlides.length} />
          </Animated.View>

          <View className="mt-auto pb-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
            {isLastSlide ? (
              <OnboardingButton
                label="Get Started"
                onPress={handleNext}
                fullWidth
                testID="get-started-button"
              />
            ) : (
              <View className="flex-row items-center gap-3">
                <View className="w-[60px]">
                  <OnboardingButton
                    label="Skip"
                    variant="secondary"
                    onPress={handleSkip}
                    testID="skip-button"
                  />
                </View>
                <View className="flex-1">
                  <OnboardingButton
                    label="Next"
                    onPress={handleNext}
                    fullWidth
                    icon={<ArrowIcon />}
                    testID="next-button"
                  />
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
