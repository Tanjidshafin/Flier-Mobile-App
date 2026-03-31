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
  roomCount: number;
  roomTypeId: string;
  roomTypeImage?: string | null;
  roomTypeName: string;
  contactPhone?: string;
  specialRequests?: string;
};

export type BookingPayload = {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomCount: number;
  roomTypeId: string;
  contactPhone?: string;
  specialRequests?: string;
  idempotencyKey?: string;
};

export type BookingActionPayload = {
  idempotencyKey?: string;
  paymentIntentId?: string | null;
  reason?: string;
};

export type PaymentSession = {
  customerId: string | null;
  ephemeralKeySecret: string | null;
  merchantDisplayName: string;
  paymentIntentClientSecret: string | null;
  paymentIntentId: string | null;
  provider: 'stripe' | 'mock';
  publishableKey: string | null;
};

export type BookingSummary = {
  bookingStatus: 'pending_payment' | 'confirmed' | 'cancelled' | 'payment_failed' | 'expired';
  canCancel: boolean;
  cancelledAt?: string | null;
  cancellationReason: string;
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
  holdExpiresAt?: string | null;
  payment: {
    amount: number;
    currency: string;
    lastError: string;
    paidAt?: string | null;
    paymentIntentId?: string | null;
    provider: 'stripe' | 'mock';
  };
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  pricing: {
    baseAmount: number;
    cleaningFee: number;
    currency: string;
    serviceFee: number;
    taxAmount: number;
    totalAmount: number;
  };
  roomCount: number;
  roomType: {
    amenities: string[];
    beds: number;
    code: string;
    image: string | null;
    maxGuests: number;
    name: string;
    nightlyRate: number;
  };
  roomTypeId: string;
  specialRequests: string;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'payment_failed' | 'expired';
  createdAt: string;
};

export type BookingHoldResponse = {
  booking: BookingSummary;
  paymentSession: PaymentSession;
};
