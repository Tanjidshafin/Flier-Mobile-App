import { OnboardingSlide } from '../types/onboarding';

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'discover',
    title: 'Discover Stays That\nFeel Curated',
    description:
      'Browse design-led hotels across Indonesia with a booking flow made for quick city breaks and slow weekends.',
    image: require('../assets/images/onboarding-1.webp'),
    variant: 'hero',
  },
  {
    id: 'compare',
    title: 'Search Faster, Filter\nSmarter, Travel Better',
    description:
      'Pick destinations, compare amenities, and fine-tune your stay with guest counts, ratings, and price ranges.',
    image: require('../assets/images/onboarding-2.jpg'),
    variant: 'hero',
  },
  {
    id: 'book',
    title: 'Save Favorites And\nBook With Confidence',
    description:
      'Keep a local wishlist, sign in only when you are ready to book, and confirm stays in a few taps.',
    image: require('../assets/images/onboarding-3.jpg'),
    variant: 'mosaic',
  },
];
