export type PricingSummary = {
  amount: number;
  currency: string;
};

export type HotelLocation = {
  address: string;
  area: string;
  city: string;
  country: string;
  destinationId: string;
};

export type HotelSummary = {
  id: string;
  name: string;
  slug: string;
  image: string;
  location: HotelLocation;
  locationLabel: string;
  shortDescription: string;
  rating: number;
  reviewCount: number;
  rooms: number;
  baths: number;
  squareMeters: number;
  maxGuests: number;
  featured: boolean;
  tag?: string | null;
  amenities: string[];
  price: PricingSummary;
};

export type HotelDetails = HotelSummary & {
  availableRooms: number;
  description: string;
  images: string[];
  policies: {
    cancellation: string;
    checkInFrom: string;
    checkOutUntil: string;
    houseRules: string[];
  };
  pricing: {
    nightlyRate: number;
    cleaningFee: number;
    serviceFee: number;
    taxRate: number;
    currency: string;
  };
};

export type DestinationSuggestion = {
  destinationId: string;
  image: string;
  label: string;
  secondaryLabel: string;
};

export type FeaturedDestination = {
  destinationId: string;
  image: string;
  locationLabel: string;
  recommendedStayCount: number;
  subtitle: string;
};

export type SearchFilters = {
  query: string;
  destinationId?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities: string[];
  sortBy: 'recommended' | 'priceAsc' | 'priceDesc' | 'ratingDesc';
};

export type HomePayload = {
  featuredHotels: HotelSummary[];
  featuredDestinations: FeaturedDestination[];
};

export type HotelSearchResponse = {
  items: HotelSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type WishlistEntry = {
  id: string;
  savedAt: string;
  hotel: HotelSummary;
};
