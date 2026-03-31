import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Asset, launchImageLibrary } from 'react-native-image-picker';

import {
  archiveAdminHotel,
  createAdminHotel,
  createHotelImageUploadSignature,
  deleteAdminNotification,
  fetchAdminConversationMessages,
  fetchAdminConversations,
  fetchAdminDashboard,
  fetchAdminHotel,
  fetchAdminHotels,
  fetchAdminNotifications,
  fetchAdminUsers,
  markAdminConversationSeen,
  markAdminNotificationRead,
  sendAdminMessage,
  updateAdminHotel,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../../services/api';
import { AdminConversationMessagesPayload, AdminHotelPayload } from '../../types/admin';
import { ChatMessage } from '../../types/chat';
import { NotificationItem } from '../../types/notification';

export function useAdminDashboardQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: fetchAdminDashboard,
    queryKey: ['admin-dashboard'],
  });
}

export function useAdminHotelsQuery(
  params: Parameters<typeof fetchAdminHotels>[0],
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => fetchAdminHotels(params),
    queryKey: ['admin-hotels', params],
  });
}

export function useAdminHotelQuery(hotelId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(hotelId),
    queryFn: () => fetchAdminHotel(hotelId),
    queryKey: ['admin-hotel', hotelId],
  });
}

export function useCreateAdminHotelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminHotelPayload) => createAdminHotel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
    },
  });
}

export function useUpdateAdminHotelMutation(hotelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminHotelPayload) => updateAdminHotel(hotelId, payload),
    onSuccess: hotel => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      queryClient.setQueryData(['admin-hotel', hotel.id], hotel);
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel-details'] });
    },
  });
}

export function useArchiveAdminHotelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveAdminHotel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel-details'] });
    },
  });
}

export function useAdminUsersQuery(
  params: Parameters<typeof fetchAdminUsers>[0],
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => fetchAdminUsers(params),
    queryKey: ['admin-users', params],
  });
}

export function useUpdateAdminUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      role,
      userId,
    }: {
      role: 'user' | 'admin';
      userId: string;
    }) => updateAdminUserRole(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useUpdateAdminUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reason,
      status,
      userId,
    }: {
      reason?: string;
      status: 'active' | 'suspended';
      userId: string;
    }) => updateAdminUserStatus(userId, { reason, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useAdminConversationsQuery(
  params: Parameters<typeof fetchAdminConversations>[0],
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => fetchAdminConversations(params),
    queryKey: ['admin-conversations', params],
  });
}

export function useAdminConversationMessagesQuery(conversationId: string, enabled = true) {
  return useQuery({
    enabled: enabled && Boolean(conversationId),
    queryFn: () => fetchAdminConversationMessages(conversationId),
    queryKey: ['admin-messages', conversationId],
  });
}

export function useSendAdminMessageMutation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { body: string }) => sendAdminMessage(conversationId, payload),
    onSuccess: message => {
      queryClient.setQueryData<AdminConversationMessagesPayload | undefined>(
        ['admin-messages', conversationId],
        previous => upsertAdminMessage(previous, message),
      );
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    },
  });
}

export function useMarkAdminConversationSeenMutation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAdminConversationSeen(conversationId),
    onSuccess: messages => {
      queryClient.setQueryData<AdminConversationMessagesPayload | undefined>(
        ['admin-messages', conversationId],
        previous =>
          previous
            ? {
                ...previous,
                messages,
              }
            : previous,
      );
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    },
  });
}

export function useAdminNotificationsQuery(enabled = true) {
  return useQuery({
    enabled,
    queryFn: fetchAdminNotifications,
    queryKey: ['admin-notifications'],
  });
}

export function useMarkAdminNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAdminNotificationRead,
    onSuccess: notification => {
      queryClient.setQueryData<NotificationItem[] | undefined>(
        ['admin-notifications'],
        previous =>
          previous?.map(item =>
            item.id === notification.id ? notification : item,
          ) || [],
      );
    },
  });
}

export function useDeleteAdminNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminNotification,
    onMutate: async notificationId => {
      await queryClient.cancelQueries({ queryKey: ['admin-notifications'] });
      const previous =
        queryClient.getQueryData<NotificationItem[]>(['admin-notifications']) || [];
      queryClient.setQueryData<NotificationItem[]>(
        ['admin-notifications'],
        previous.filter(item => item.id !== notificationId),
      );
      return { previous };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-notifications'], context.previous);
      }
    },
  });
}

export async function pickHotelImages() {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    selectionLimit: 0,
  });

  if (result.didCancel || !result.assets?.length) {
    return [];
  }

  return result.assets;
}

async function uploadSingleHotelImage(asset: Asset) {
  if (!asset.uri || !asset.type || !asset.fileName) {
    return null;
  }

  const signature = await createHotelImageUploadSignature();
  const formData = new FormData();
  formData.append('file', {
    name: asset.fileName,
    type: asset.type,
    uri: asset.uri,
  } as never);
  formData.append('api_key', signature.apiKey);
  formData.append('folder', signature.folder);
  formData.append('public_id', signature.publicId);
  formData.append('signature', signature.signature);
  formData.append('timestamp', `${signature.timestamp}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    {
      body: formData,
      method: 'POST',
    },
  );

  if (!response.ok) {
    throw new Error('Hotel image upload failed.');
  }

  const payload = (await response.json()) as {
    secure_url: string;
  };

  return payload.secure_url;
}

export async function uploadHotelImagesToCloudinary() {
  const assets = await pickHotelImages();

  if (!assets.length) {
    return [];
  }

  const uploadedImages = await Promise.all(assets.map(uploadSingleHotelImage));
  return uploadedImages.filter((item): item is string => Boolean(item));
}

export function upsertAdminMessage(
  payload: AdminConversationMessagesPayload | undefined,
  message: ChatMessage,
) {
  if (!payload) {
    return payload;
  }

  const existingIndex = payload.messages.findIndex(item => item.id === message.id);

  if (existingIndex < 0) {
    return {
      ...payload,
      messages: [...payload.messages, message],
    };
  }

  const nextMessages = [...payload.messages];
  nextMessages[existingIndex] = message;

  return {
    ...payload,
    messages: nextMessages,
  };
}
