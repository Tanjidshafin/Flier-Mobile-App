export type BookingDraft = {
  hotelId: string;
  hotelSlug: string;
  hotelName: string;
  hotelImage: string;
  locationLabel: string;
  nightlyRate: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  contactPhone?: string;
  specialRequests?: string;
};

export type BookingPayload = {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  contactPhone?: string;
  specialRequests?: string;
};

export type BookingSummary = {
  id: string;
  confirmationCode: string;
  checkIn: string;
  checkOut: string;
  contactPhone: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  hotel: {
    coverImage: string;
    locationLabel: string;
    name: string;
    nightlyRate: number;
    slug: string;
  };
  nights: number;
  pricing: {
    baseAmount: number;
    cleaningFee: number;
    currency: string;
    serviceFee: number;
    taxAmount: number;
    totalAmount: number;
  };
  specialRequests: string;
  status: 'confirmed';
  createdAt: string;
};
