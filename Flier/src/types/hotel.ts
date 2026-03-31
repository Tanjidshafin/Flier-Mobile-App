export type PricingSummary = {
  amount: number;
  currency: string;
};

export type DestinationSelection = {
  destinationId?: string;
  destinationLabel: string;
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

export type RoomType = {
  amenities: string[];
  availableUnits: number;
  beds: number;
  code: string;
  description: string;
  image: string | null;
  maxGuests: number;
  name: string;
  nightlyRate: number;
  reservedUnits: number;
};

export type ReviewPreview = {
  authorAvatar: string | null;
  authorName: string;
  comment: string;
  createdAt: string;
  id: string;
  rating: number;
};

export type HotelAvailability = {
  byRoomType: Record<
    string,
    {
      availableUnits: number;
      reservedUnits: number;
    }
  >;
  hasAvailability: boolean;
  totalAvailableRooms: number;
};

export type HotelDetails = HotelSummary & {
  availableRooms: number;
  availability: HotelAvailability;
  cancellationWindowHours: number;
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
  recentReviews: ReviewPreview[];
  reviewsSummary: {
    average: number;
    categories: {
      cleanliness: number;
      location: number;
      service: number;
      value: number;
    };
    total: number;
  };
  roomTypes: RoomType[];
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
  searchText: string;
  destinationId?: string;
  destinationLabel?: string;
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

export type HotelSearchParams = SearchFilters & {
  cursor?: string | null;
  limit?: number;
};

export type HomePayload = {
  featuredHotels: HotelSummary[];
  featuredDestinations: FeaturedDestination[];
};

export type HotelListCursor = {
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
  page: number;
  total: number;
  totalCount: number;
  totalPages: number;
};

export type HotelSearchResponse = {
  items: HotelSummary[];
  pagination: HotelListCursor;
};

export type WishlistEntry = {
  id: string;
  savedAt: string;
  hotel: HotelSummary;
};
