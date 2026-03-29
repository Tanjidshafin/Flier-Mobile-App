import { ImageSourcePropType } from 'react-native';

export type OnboardingVariant = 'hero' | 'mosaic';

export type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  variant: OnboardingVariant;
};
