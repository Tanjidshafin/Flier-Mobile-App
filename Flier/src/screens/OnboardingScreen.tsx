import React from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ArrowIcon,
  OnboardingButton,
  PaginationDots,
} from '../components/OnboardingControls';
import { SlideVisual } from '../components/SlideVisual';
import { onboardingSlides } from '../data/onboardingSlides';
import { useBootstrapStore } from '../store/bootstrapStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types/navigation';
import { OnboardingSlide } from '../types/onboarding';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const completeOnboarding = useBootstrapStore(state => state.completeOnboarding);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const listRef = React.useRef<FlatList<OnboardingSlide>>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeSlide = onboardingSlides[activeIndex];
  const isLastSlide = activeIndex === onboardingSlides.length - 1;
  const availableHeight = windowHeight - insets.top - insets.bottom;
  const horizontalPadding = 20;
  const cardWidth = windowWidth - horizontalPadding * 2;
  const visualHeight = Math.min(Math.max(availableHeight * 0.44, 300), 410);
  const bottomSpacing = Math.max(insets.bottom, 14);

  const scrollToIndex = React.useCallback(
    (index: number) => {
      listRef.current?.scrollToOffset({
        offset: index * cardWidth,
        animated: true,
      });
      setActiveIndex(index);
    },
    [cardWidth],
  );

  const handleMomentumEnd = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / cardWidth,
      );
      setActiveIndex(nextIndex);
    },
    [cardWidth],
  );
  const handleSkip = React.useCallback(() => {
    scrollToIndex(onboardingSlides.length - 1);
  }, [scrollToIndex]);

  const handleNext = React.useCallback(() => {
    if (isLastSlide) {
      completeOnboarding();
      navigation.replace('MainTabs');
      return;
    }

    scrollToIndex(activeIndex + 1);
  }, [activeIndex, completeOnboarding, isLastSlide, navigation, scrollToIndex]);

  const renderItem = ({ item }: ListRenderItemInfo<OnboardingSlide>) => (
    <View
      style={{
        width: cardWidth,
        overflow: 'hidden',
        backgroundColor: colors.surfaceMuted,
      }}
    >
      <SlideVisual
        image={item.image}
        variant={item.variant}
        height={visualHeight}
        width={cardWidth}
      />
    </View>
  );

  return (
    <View
      className="flex-1 bg-brand-surfaceMuted"
      style={{ paddingTop: insets.top + 6 }}
    >
      <View
        className="flex-1"
        style={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: bottomSpacing,
        }}
      >
        <View style={{ height: visualHeight + 20, overflow: 'hidden' }}>
          <FlatList
            ref={listRef}
            style={{ width: cardWidth }}
            data={onboardingSlides}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            removeClippedSubviews
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={2}
            getItemLayout={(_, index) => ({
              length: cardWidth,
              offset: cardWidth * index,
              index,
            })}
            snapToInterval={cardWidth}
            snapToAlignment="start"
            disableIntervalMomentum
            decelerationRate="fast"
            onMomentumScrollEnd={handleMomentumEnd}
            testID="onboarding-carousel"
          />
        </View>

        <Animated.View
          layout={Layout.springify()}
          className="flex-1 pt-7"
          style={{ justifyContent: 'space-between' }}
        >
          <Animated.View
            entering={FadeInDown.duration(300)}
            key={activeSlide.id}
            className="items-center pt-1"
          >
            <Text
              style={typography.heading}
              className="max-w-[290px] text-center text-brand-text"
            >
              {activeSlide.title}
            </Text>
            <Text
              style={typography.body}
              className="mt-3 max-w-[292px] text-center text-brand-muted"
            >
              {activeSlide.description}
            </Text>
          </Animated.View>

          <View className="pb-1 pt-6">
            <Animated.View
              entering={FadeInUp.delay(80).duration(320)}
              key={`${activeSlide.id}-dots`}
              className="items-center justify-center"
            >
              <PaginationDots
                activeIndex={activeIndex}
                total={onboardingSlides.length}
              />
            </Animated.View>

            <View className="mt-7">
              {isLastSlide ? (
                <OnboardingButton
                  label="Get Started"
                  onPress={handleNext}
                  fullWidth
                  testID="get-started-button"
                />
              ) : (
                <View className="flex-row items-center gap-3">
                  <View className="w-[90px]">
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
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
