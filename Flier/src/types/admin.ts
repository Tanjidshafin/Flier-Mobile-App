import { ChatMessage, Conversation } from './chat';
import { ReviewPreview, RoomType } from './hotel';
import { AuthUser } from './auth';

export type AdminPagination = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type AdminListResponse<T> = {
  items: T[];
  pagination: AdminPagination;
};

export type AdminActivityItem = {
  createdAt: string;
  description: string;
  id: string;
  title: string;
  type: 'user' | 'booking' | 'message';
};

export type AdminDashboardPayload = {
  recentActivity: AdminActivityItem[];
  stats: {
    activeHotels: number;
    confirmedBookings: number;
    netRevenue: number;
    totalAdmins: number;
    totalUsers: number;
  };
};

export type AdminHotel = {
  amenities: string[];
  availableRooms: number;
  baths: number;
  cancellationWindowHours: number;
  createdAt: string;
  description: string;
  featured: boolean;
  featuredDestination: boolean;
  id: string;
  images: string[];
  location: {
    address: string;
    area: string;
    city: string;
    country: string;
    destinationId: string;
  };
  maxGuests: number;
  name: string;
  policies: {
    cancellation: string;
    checkInFrom: string;
    checkOutUntil: string;
    houseRules: string[];
  };
  pricing: {
    cleaningFee: number;
    currency: string;
    nightlyRate: number;
    serviceFee: number;
    taxRate: number;
  };
  rating: number;
  recentReviews: ReviewPreview[];
  reviewCount: number;
  reviewsSummary: {
    categories: {
      cleanliness: number | null;
      location: number | null;
      service: number | null;
      value: number | null;
    };
    total: number;
  };
  roomTypes: Array<
    Omit<RoomType, 'reservedUnits'> & {
      reservedUnits?: number;
    }
  >;
  rooms: number;
  shortDescription: string;
  slug: string;
  squareMeters: number;
  status: 'active' | 'archived';
  tag?: string | null;
  updatedAt: string;
};

export type AdminHotelPayload = Omit<AdminHotel, 'createdAt' | 'id' | 'updatedAt'>;

export type AdminUser = AuthUser & {
  suspensionReason?: string | null;
  suspendedAt?: string | null;
};

export type AdminConversation = Conversation & {
  lastMessagePreview: string;
  unreadCount: number;
  user: Pick<AuthUser, 'email' | 'fullName' | 'id' | 'role' | 'status'>;
};

export type AdminConversationMessagesPayload = {
  conversation: AdminConversation;
  messages: ChatMessage[];
};
