import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createConversation,
  listConversations,
  listMessages,
  markConversationSeen,
  sendMessage,
} from '../../services/api';

export function useConversationsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: listConversations,
    queryKey: ['conversations'],
  });
}

export function useMessagesQuery(conversationId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(conversationId),
    queryFn: () => listMessages(conversationId),
    queryKey: ['messages', conversationId],
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useSendMessageMutation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { body: string }) => sendMessage(conversationId, payload),
    onSuccess: message => {
      queryClient.setQueryData(['messages', conversationId], (previous: unknown) => {
        const items = Array.isArray(previous) ? previous : [];
        return [...items, message];
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkConversationSeenMutation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markConversationSeen(conversationId),
    onSuccess: messages => {
      queryClient.setQueryData(['messages', conversationId], messages);
    },
  });
}
