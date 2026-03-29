import { OnboardingSlide } from '../types/onboarding';

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'gateway',
    title: 'Gateway to Your\nAdventure',
    description:
      'Enjoy various housing options, from budget to luxury, in Flier.',
    image: require('../assets/images/onboarding-1.png'),
    variant: 'hero',
  },
  {
    id: 'discover',
    title: 'Discover the Wonders of\nthe World: Let\'s Explore!',
    description: 'Book a stay wherever you are, whenever you want.',
    image: require('../assets/images/onboarding-2.png'),
    variant: 'hero',
  },
  {
    id: 'holiday',
    title: 'The Right Solution for Your\nHoliday Accommodation',
    description:
      'A stress-free Holiday? Trust your Holiday accommodation to Flier!',
    image: require('../assets/images/onboarding-3.png'),
    variant: 'mosaic',
  },
];
