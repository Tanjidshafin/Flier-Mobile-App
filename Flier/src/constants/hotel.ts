export const AMENITY_OPTIONS = [
  'Wifi',
  'Pool',
  'Breakfast Included',
  'Spa',
  'Gym',
  'Beach Access',
  'Ocean View',
  'Parking',
] as const;

export const PRICE_PRESETS = [
  { label: '$0-$120', maxPrice: 120, minPrice: 0 },
  { label: '$120-$180', maxPrice: 180, minPrice: 120 },
  { label: '$180-$260', maxPrice: 260, minPrice: 180 },
] as const;

export const RATING_OPTIONS = [4.0, 4.5, 4.8] as const;

export const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price Low', value: 'priceAsc' },
  { label: 'Price High', value: 'priceDesc' },
  { label: 'Top Rated', value: 'ratingDesc' },
] as const;
