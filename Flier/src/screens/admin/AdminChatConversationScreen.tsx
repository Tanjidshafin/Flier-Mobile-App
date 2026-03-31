import React from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AdminScreenLayout } from '../../components/admin/AdminScreenLayout';
import { EmptyState } from '../../components/app/EmptyState';
import { PrimaryAction } from '../../components/app/PrimaryAction';
import {
  useAdminConversationMessagesQuery,
  useMarkAdminConversationSeenMutation,
  useSendAdminMessageMutation,
} from '../../features/admin/hooks';
import { useRealtime } from '../../features/realtime/RealtimeProvider';
import { useUIStore } from '../../store/uiStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AdminStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminChatConversation'>;

export function AdminChatConversationScreen({ navigation, route }: Props) {
  const { emitTyping, joinConversation, leaveConversation, socket } = useRealtime();
  const showToast = useUIStore(state => state.showToast);
  const conversationId = route.params?.conversationId || route.params?.conversation?.id || '';
  const query = useAdminConversationMessagesQuery(conversationId, Boolean(conversationId));
  const sendMutation = useSendAdminMessageMutation(conversationId);
  const seenMutation = useMarkAdminConversationSeenMutation(conversationId);
  const [draftMessage, setDraftMessage] = React.useState('');
  const [isRemoteTyping, setIsRemoteTyping] = React.useState(false);

  React.useEffect(() => {
    if (!conversationId) {
      return;
    }

    joinConversation(conversationId);
    void seenMutation.mutateAsync();

    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId, joinConversation, leaveConversation, seenMutation]);

  React.useEffect(() => {
    if (!socket) {
      return;
    }

    const handleTyping = (payload: { conversationId: string; isTyping: boolean }) => {
      if (payload.conversationId === conversationId) {
        setIsRemoteTyping(payload.isTyping);
      }
    };

    socket.on('conversation:typing', handleTyping);

    return () => {
      socket.off('conversation:typing', handleTyping);
    };
  }, [conversationId, socket]);

  const conversation = query.data?.conversation || route.params?.conversation;
  const messages = query.data?.messages || [];

  return (
    <AdminScreenLayout
      onBackPress={() => navigation.goBack()}
      title={conversation?.user.fullName || 'Conversation'}>
      <View className="flex-1 px-5 pb-6 pt-4">
        <View className="rounded-[24px] bg-white px-4 py-4">
          <Text style={typography.caption} className="text-brand-muted">
            {conversation?.user.email || 'Guest'}
          </Text>
          <Text style={[typography.body, { marginTop: 6 }]} className="text-brand-text">
            {conversation?.hotel.name} · {conversation?.hotel.locationLabel}
          </Text>
        </View>

        <FlatList
          contentContainerStyle={{ gap: 10, paddingBottom: 24, paddingTop: 18 }}
          data={messages}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <EmptyState
              message="The guest has not sent any messages yet."
              title="No messages"
            />
          }
          renderItem={({ item }) => {
            const isAdmin = item.senderRole === 'admin';
            return (
              <View className={`${isAdmin ? 'items-end' : 'items-start'}`}>
                <View
                  className={`max-w-[84%] rounded-[22px] px-4 py-3 ${isAdmin ? 'bg-brand-primary' : 'bg-white'}`}>
                  <Text
                    style={[
                      typography.body,
                      {
                        color: isAdmin ? '#FFFFFF' : colors.textPrimary,
                      },
                    ]}>
                    {item.body}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
                  {item.status}
                </Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />

        <View className="rounded-[24px] bg-white px-4 py-4">
          {isRemoteTyping ? (
            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
              Guest is typing...
            </Text>
          ) : null}
          <View className="flex-row items-end gap-3">
            <View className="flex-1 rounded-[20px] bg-brand-surfaceMuted px-4 py-2">
              <TextInput
                multiline
                onChangeText={value => {
                  setDraftMessage(value);
                  emitTyping(conversationId, value.trim().length > 0);
                }}
                placeholder="Reply to the guest..."
                placeholderTextColor={colors.textMuted}
                style={[typography.body, { color: colors.textPrimary, minHeight: 44 }]}
                value={draftMessage}
              />
            </View>
            <View style={{ width: 122 }}>
              <PrimaryAction
                disabled={sendMutation.isPending || !draftMessage.trim()}
                label={sendMutation.isPending ? 'Sending...' : 'Send'}
                onPress={async () => {
                  try {
                    const body = draftMessage.trim();
                    setDraftMessage('');
                    emitTyping(conversationId, false);
                    await sendMutation.mutateAsync({ body });
                  } catch (error) {
                    showToast({
                      message:
                        error instanceof Error
                          ? error.message
                          : 'Unable to send admin message.',
                      title: 'Send failed',
                      tone: 'error',
                    });
                  }
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </AdminScreenLayout>
  );
}
