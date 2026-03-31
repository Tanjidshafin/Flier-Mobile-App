import { AdminHotelPayload } from '../../types/admin';

export function slugifyAdminLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function splitCommaSeparated(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export function joinCommaSeparated(values: string[]) {
  return values.join(', ');
}

export function createEmptyRoomType() {
  return {
    amenities: [] as string[],
    availableUnits: 1,
    beds: 1,
    code: `room-${Date.now()}`,
    description: '',
    image: '',
    maxGuests: 2,
    name: '',
    nightlyRate: 0,
  };
}

export function createEmptyAdminHotelPayload(): AdminHotelPayload {
  return {
    amenities: [],
    availableRooms: 1,
    baths: 1,
    cancellationWindowHours: 48,
    description: '',
    featured: false,
    featuredDestination: false,
    images: [],
    location: {
      address: '',
      area: '',
      city: '',
      country: '',
      destinationId: '',
    },
    maxGuests: 2,
    name: '',
    policies: {
      cancellation: '',
      checkInFrom: '',
      checkOutUntil: '',
      houseRules: [],
    },
    pricing: {
      cleaningFee: 0,
      currency: 'USD',
      nightlyRate: 0,
      serviceFee: 0,
      taxRate: 0.1,
    },
    rating: 4.5,
    recentReviews: [],
    reviewCount: 0,
    reviewsSummary: {
      categories: {
        cleanliness: 4.5,
        location: 4.5,
        service: 4.5,
        value: 4.3,
      },
      total: 0,
    },
    roomTypes: [createEmptyRoomType()],
    rooms: 1,
    shortDescription: '',
    slug: '',
    squareMeters: 32,
    status: 'active',
    tag: '',
  };
}
