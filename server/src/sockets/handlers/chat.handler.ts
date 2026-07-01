import { Server, Socket } from "socket.io";
import { SocketData } from "../socket.types";
import { SOCKET_EVENTS } from "../socket.constants";
import { validatePayload, withErrorHandling } from "../socket.middleware";
import { SendMessageSchema, SendMessageDTO, TypingStartSchema, TypingStopSchema, EditMessageSchema, DeleteMessageSchema, ReactionSchema, ReadReceiptSchema, EditMessageDTO, DeleteMessageDTO, ReactionDTO, ReadReceiptDTO } from "@/validators/chat.validator";
import { chatService } from "@/services/chat.service";
import { createSuccessResponse } from "../socket.utils";

export const registerChatHandlers = (io: Server, socket: Socket<any, any, any, SocketData>) => {
  const userId = socket.data.user.id;

    socket.on(SOCKET_EVENTS.CHAT_SEND, async (payload, ack) => {
      await withErrorHandling(async (socket, data, ackFn) => {
        const validated = validatePayload(SendMessageSchema)(data, ackFn);
        if (!validated.success) return;
        const { roomId, content } = validated.data as SendMessageDTO;
        const message = await chatService.handleSendMessage(roomId, userId, content);
        if (typeof ackFn === "function") {
          ackFn(createSuccessResponse(message));
        }
      })(socket, payload, ack);
    });

  // Typing start
  socket.on(SOCKET_EVENTS.CHAT_TYPING_START, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(TypingStartSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId } = validated.data as TypingStartSchema;
      await chatService.handleTyping(roomId, userId, true);
      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });

  // Typing stop
  socket.on(SOCKET_EVENTS.CHAT_TYPING_STOP, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(TypingStopSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId } = validated.data as TypingStopSchema;
      await chatService.handleTyping(roomId, userId, false);
      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });
    // Edit message
    socket.on(SOCKET_EVENTS.CHAT_EDIT, async (payload, ack) => {
      await withErrorHandling(async (socket, data, ackFn) => {
        const validated = validatePayload(EditMessageSchema)(data, ackFn);
        if (!validated.success) return;
        const { messageId, content } = validated.data as EditMessageDTO;
        const roomId = socket.data.roomId;
        const message = await chatService.handleEditMessage(roomId, userId, messageId, content);
        if (typeof ackFn === "function") {
          ackFn(createSuccessResponse(message));
        }
      })(socket, payload, ack);
    });

  // Delete message
  socket.on(SOCKET_EVENTS.CHAT_DELETE, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(DeleteMessageSchema)(data, ackFn);
      if (!validated.success) return;
      const { messageId } = validated.data as DeleteMessageDTO;
      const roomId = socket.data.roomId;
      await chatService.handleDeleteMessage(roomId, userId, messageId);
      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });

  // Reaction add
  socket.on(SOCKET_EVENTS.CHAT_REACTION_ADD, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(ReactionSchema)(data, ackFn);
      if (!validated.success) return;
      const { messageId, emoji } = validated.data as ReactionDTO;
        const roomId = socket.data.roomId;
        const reaction = await chatService.handleAddReaction(roomId, userId, messageId, emoji);
        if (typeof ackFn === "function") {
          ackFn(createSuccessResponse(reaction));
        }
    })(socket, payload, ack);
  });

  // Reaction remove
  socket.on(SOCKET_EVENTS.CHAT_REACTION_REMOVE, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(ReactionSchema)(data, ackFn);
      if (!validated.success) return;
      const { messageId, emoji } = validated.data as ReactionDTO;
      const roomId = socket.data.roomId;
      await chatService.handleRemoveReaction(roomId, userId, messageId, emoji);
      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });

  // Read receipt
  socket.on(SOCKET_EVENTS.CHAT_READ_RECEIPT, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(ReadReceiptSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, lastReadMessageId } = validated.data as ReadReceiptDTO;
      await chatService.handleReadReceipt(roomId, userId, lastReadMessageId);
      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });

};
