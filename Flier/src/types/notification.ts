export type NotificationItem = {
  body: string;
  createdAt: string;
  data: {
    bookingId?: string | null;
    conversationId?: string | null;
    hotelSlug?: string | null;
    routeName?: string | null;
  };
  id: string;
  isRead: boolean;
  readAt?: string | null;
  scope: 'user' | 'admin';
  title: string;
  type: 'booking_update' | 'chat_message' | 'system_alert';
};
