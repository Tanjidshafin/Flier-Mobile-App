import React from 'react';
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppIcon from '../components/AppIcon';
import { EmptyState } from '../components/app/EmptyState';
import { PrimaryAction } from '../components/app/PrimaryAction';
import { ScreenHeader } from '../components/app/ScreenHeader';
import {
  useConversationsQuery,
  useCreateConversationMutation,
  useMarkConversationSeenMutation,
  useMessagesQuery,
  useSendMessageMutation,
} from '../features/chat/hooks';
import { useRealtime } from '../features/realtime/RealtimeProvider';
import { useUIStore } from '../store/uiStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { emitTyping, joinConversation, leaveConversation, socket } = useRealtime();
  const showToast = useUIStore(state => state.showToast);
  const conversationsQuery = useConversationsQuery(true);
  const createConversationMutation = useCreateConversationMutation();
  const [conversationId, setConversationId] = React.useState(route.params?.conversationId || '');
  const [draftMessage, setDraftMessage] = React.useState('');
  const [isRemoteTyping, setIsRemoteTyping] = React.useState(false);
  const messagesQuery = useMessagesQuery(conversationId, Boolean(conversationId));
  const sendMessageMutation = useSendMessageMutation(conversationId);
  const markSeenMutation = useMarkConversationSeenMutation(conversationId);

  React.useEffect(() => {
    if (route.params?.hotelId && !conversationId && !createConversationMutation.isPending) {
      void createConversationMutation
        .mutateAsync({
          hotelId: route.params.hotelId,
          subject: route.params.hotelName
            ? `Chat about ${route.params.hotelName}`
            : 'Hotel support',
        })
        .then(conversation => {
          setConversationId(conversation.id);
        })
        .catch(error => {
          showToast({
            message: error instanceof Error ? error.message : 'Unable to start chat.',
            title: 'Chat unavailable',
            tone: 'error',
          });
        });
    }
  }, [
    conversationId,
    createConversationMutation,
    route.params?.hotelId,
    route.params?.hotelName,
    showToast,
  ]);

  React.useEffect(() => {
    if (!conversationId) {
      return;
    }

    joinConversation(conversationId);
    void markSeenMutation.mutateAsync();

    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId, joinConversation, leaveConversation, markSeenMutation]);

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

  const selectedConversation =
    conversationsQuery.data?.find(item => item.id === conversationId) || null;
  const messages = messagesQuery.data || [];

  return (
    <View className="flex-1 bg-brand-surfaceMuted" style={{ paddingTop: insets.top + 12 }}>
      <View className="px-5">
        <ScreenHeader
          onBackPress={() => navigation.goBack()}
          title={selectedConversation?.hotel.name || route.params?.hotelName || 'Support chat'}
        />
      </View>

      {!conversationId ? (
        <FlatList
          contentContainerStyle={{ gap: 12, padding: 20, paddingBottom: 120 }}
          data={conversationsQuery.data || []}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <EmptyState
              message="Start a conversation from any hotel details screen and it will appear here."
              title="No conversations yet"
            />
          }
          renderItem={({ item }) => (
            <Pressable
              className="rounded-[24px] bg-white p-4"
              onPress={() => setConversationId(item.id)}>
              <Text style={typography.title} className="text-brand-text">
                {item.hotel.name}
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                {item.lastMessage?.body || item.subject}
              </Text>
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          <FlatList
            contentContainerStyle={{ gap: 10, padding: 20, paddingBottom: 120 }}
            data={messages}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <EmptyState
                message="Send the first message to talk with the hotel team."
                title="No messages yet"
              />
            }
            renderItem={({ item }) => {
              const isUser = item.senderRole === 'user';
              return (
                <View className={`${isUser ? 'items-end' : 'items-start'}`}>
                  <View
                    className={`max-w-[80%] rounded-[22px] px-4 py-3 ${isUser ? 'bg-brand-primary' : 'bg-white'}`}>
                    <Text
                      style={[
                        typography.body,
                        {
                          color: isUser ? '#FFFFFF' : colors.textPrimary,
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

          <View
            className="absolute inset-x-0 bottom-0 border-t border-brand-border bg-white px-5"
            style={{ paddingBottom: Math.max(insets.bottom, 18), paddingTop: 14 }}>
            {isRemoteTyping ? (
              <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 8 }]}>
                Support is typing...
              </Text>
            ) : null}
            <View className="flex-row items-end gap-3">
              <View className="flex-1 rounded-[22px] bg-brand-surfaceMuted px-4 py-2">
                <TextInput
                  multiline
                  onChangeText={value => {
                    setDraftMessage(value);
                    emitTyping(conversationId, value.trim().length > 0);
                  }}
                  placeholder="Message the hotel team..."
                  placeholderTextColor={colors.textMuted}
                  style={[typography.body, { color: colors.textPrimary, minHeight: 44 }]}
                  value={draftMessage}
                />
              </View>
              <View style={{ width: 120 }}>
                <PrimaryAction
                  disabled={sendMessageMutation.isPending || !draftMessage.trim()}
                  label={sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                  onPress={async () => {
                    try {
                      const body = draftMessage.trim();
                      setDraftMessage('');
                      emitTyping(conversationId, false);
                      await sendMessageMutation.mutateAsync({ body });
                    } catch (caughtError) {
                      showToast({
                        message:
                          caughtError instanceof Error
                            ? caughtError.message
                            : 'Unable to send message.',
                        title: 'Send failed',
                        tone: 'error',
                      });
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
