import { Server, Socket } from 'socket.io';
import { SocketData } from '../socket.types';
import { SOCKET_EVENTS } from '../socket.constants';
import { validatePayload, withErrorHandling } from '../socket.middleware';
import {
  SendMessageSchema,
  SendMessageDTO,
  TypingStartSchema,
  TypingStopSchema,
  EditMessageSchema,
  DeleteMessageSchema,
  ReactionSchema,
  ReadReceiptSchema,
  EditMessageDTO,
  DeleteMessageDTO,
  ReactionDTO,
  ReadReceiptDTO,
} from '@/validators/chat.validator';
import { chatService } from '@/services/chat.service';
import { createSuccessResponse } from '../socket.utils';

export const registerChatHandlers = (_io: Server, socket: Socket<any, any, any, SocketData>) => {
  const userId = socket.data.user.id;

  socket.on(SOCKET_EVENTS.CHAT_SEND, async (payload: any, ack: any) => {
    await withErrorHandling(async (_socket, data, ackFn) => {
      const validated = validatePayload(SendMessageSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, content } = validated.data as SendMessageDTO;
      const message = await chatService.handleSendMessage(roomId, userId, content);
      if (typeof ackFn === 'function') {
        ackFn(createSuccessResponse(message));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.CHAT_TYPING_START, async (payload: any, ack: any) => {
    await withErrorHandling(async (_socket, data, ackFn) => {
      const validated = validatePayload(TypingStartSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId } = validated.data as typeof TypingStartSchema._type;
      await chatService.handleTyping(roomId, userId, true);
      if (typeof ackFn === 'function') {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.CHAT_TYPING_STOP, async (payload: any, ack: any) => {
    await withErrorHandling(async (_socket, data, ackFn) => {
      const validated = validatePayload(TypingStopSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId } = validated.data as typeof TypingStopSchema._type;
      await chatService.handleTyping(roomId, userId, false);
      if (typeof ackFn === 'function') {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.CHAT_EDIT, async (payload: any, ack: any) => {
    await withErrorHandling(async (sock, data, ackFn) => {
      const validated = validatePayload(EditMessageSchema)(data, ackFn);
      if (!validated.success) return;
      const { messageId, content } = validated.data as EditMessageDTO;
      const roomId = sock.data.roomId ?? '';
      const message = await chatService.handleEditMessage(roomId, userId, messageId, content);
      if (typeof ackFn === 'function') {
        ackFn(createSuccessResponse(message));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.CHAT_DELETE, async (payload: any, ack: any) => {
    await withErrorHandling(async (sock, data, ackFn) => {
      const validated = validatePayload(DeleteMessageSchema)(data, ackFn);
      if (!validated.success) return;
      const { messageId } = validated.data as DeleteMessageDTO;
      const roomId = sock.data.roomId ?? '';
      await chatService.handleDeleteMessage(roomId, userId, messageId);
      if (typeof ackFn === 'function') {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.CHAT_REACTION_ADD, async (payload: any, ack: any) => {
    await withErrorHandling(async (sock, data, ackFn) => {
      const validated = validatePayload(ReactionSchema)(data, ackFn);
      if (!validated.success) return;
      const { messageId, emoji } = validated.data as ReactionDTO;
      const roomId = sock.data.roomId ?? '';
      const reaction = await chatService.handleAddReaction(roomId, userId, messageId, emoji);
      if (typeof ackFn === 'function') {
        ackFn(createSuccessResponse(reaction));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.CHAT_REACTION_REMOVE, async (payload: any, ack: any) => {
    await withErrorHandling(async (sock, data, ackFn) => {
      const validated = validatePayload(ReactionSchema)(data, ackFn);
      if (!validated.success) return;
      const { messageId, emoji } = validated.data as ReactionDTO;
      const roomId = sock.data.roomId ?? '';
      await chatService.handleRemoveReaction(roomId, userId, messageId, emoji);
      if (typeof ackFn === 'function') {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.CHAT_READ_RECEIPT, async (payload: any, ack: any) => {
    await withErrorHandling(async (_socket, data, ackFn) => {
      const validated = validatePayload(ReadReceiptSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, lastReadMessageId } = validated.data as ReadReceiptDTO;
      await chatService.handleReadReceipt(roomId, userId, lastReadMessageId);
      if (typeof ackFn === 'function') {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });
};
