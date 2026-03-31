import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteNotification,
  fetchNotifications,
  markNotificationRead,
} from '../../services/api';
import { NotificationItem } from '../../types/notification';

export function useNotificationsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: fetchNotifications,
    queryKey: ['notifications'],
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: notification => {
      queryClient.setQueryData<NotificationItem[] | undefined>(
        ['notifications'],
        previous =>
          previous?.map(item =>
            item.id === notification.id ? notification : item,
          ) || [],
      );
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onMutate: async notificationId => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<NotificationItem[]>(['notifications']) || [];
      queryClient.setQueryData<NotificationItem[]>(
        ['notifications'],
        previous.filter(item => item.id !== notificationId),
      );
      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
  });
}
