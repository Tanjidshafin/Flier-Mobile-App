import React from 'react';
import { Platform } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

import { upsertAdminMessage } from '../admin/hooks';
import { registerDevice } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { SOCKET_BASE_URL } from '../../config/env';
import { NotificationItem } from '../../types/notification';
import { ChatMessage } from '../../types/chat';

type RealtimeContextValue = {
  emitTyping: (conversationId: string, isTyping: boolean) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  socket: Socket | null;
};

const RealtimeContext = React.createContext<RealtimeContextValue>({
  emitTyping: () => undefined,
  joinConversation: () => undefined,
  leaveConversation: () => undefined,
  socket: null,
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const session = useAuthStore(state => state.session);
  const showToast = useUIStore(state => state.showToast);
  const socketRef = React.useRef<Socket | null>(null);
  const [activeSocket, setActiveSocket] = React.useState<Socket | null>(null);

  React.useEffect(() => {
    if (!session?.token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setActiveSocket(null);
      return;
    }

    void registerDevice({
      platform: Platform.OS,
      token: `${Platform.OS}:${session.user.id}`,
    }).catch(() => undefined);

    const socket = io(SOCKET_BASE_URL, {
      auth: {
        token: session.token,
      },
      transports: ['websocket'],
    });

    socket.on('notification:new', (notification: NotificationItem) => {
      const notificationKey =
        notification.scope === 'admin' ? ['admin-notifications'] : ['notifications'];

      queryClient.setQueryData<NotificationItem[]>(
        notificationKey,
        previous => [notification, ...(previous || []).filter(item => item.id !== notification.id)],
      );
      showToast({
        message: notification.body,
        title: notification.title,
        tone: notification.type === 'system_alert' ? 'info' : 'success',
      });
    });

    const updateMessage = (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(
        ['messages', message.conversationId],
        previous => {
          const items = previous || [];
          const existingIndex = items.findIndex(item => item.id === message.id);

          if (existingIndex >= 0) {
            const nextItems = [...items];
            nextItems[existingIndex] = message;
            return nextItems;
          }

          return [...items, message];
        },
      );
      queryClient.setQueryData(
        ['admin-messages', message.conversationId],
        previous => upsertAdminMessage(previous as never, message),
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    };

    socket.on('chat:message:new', updateMessage);
    socket.on('chat:message:delivered', updateMessage);
    socket.on('chat:message:seen', updateMessage);

    socketRef.current = socket;
    setActiveSocket(socket);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setActiveSocket(null);
    };
  }, [queryClient, session?.token, session?.user.id, showToast]);

  const value = React.useMemo<RealtimeContextValue>(
    () => ({
      emitTyping: (conversationId, isTyping) =>
        socketRef.current?.emit('conversation:typing', {
          conversationId,
          isTyping,
        }),
      joinConversation: conversationId =>
        socketRef.current?.emit('conversation:join', conversationId),
      leaveConversation: conversationId =>
        socketRef.current?.emit('conversation:leave', conversationId),
      socket: activeSocket,
    }),
    [activeSocket],
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return React.useContext(RealtimeContext);
}
