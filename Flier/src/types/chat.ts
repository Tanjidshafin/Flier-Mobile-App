export type ChatMessage = {
  body: string;
  conversationId: string;
  createdAt: string;
  deliveredAt?: string | null;
  id: string;
  seenAt?: string | null;
  senderRole: 'user' | 'admin' | 'system';
  status: 'sent' | 'delivered' | 'seen';
  userId?: string | null;
};

export type Conversation = {
  hotel: {
    coverImage: string | null;
    locationLabel: string;
    name: string;
    slug: string;
  };
  id: string;
  lastMessage: ChatMessage | null;
  lastMessageAt: string;
  lastMessagePreview?: string;
  subject: string;
  unreadCount?: number;
  user?: {
    email: string;
    fullName: string;
    id: string;
    role: 'user' | 'admin';
    status: 'active' | 'suspended';
  };
};
