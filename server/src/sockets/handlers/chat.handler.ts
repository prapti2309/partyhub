import { Server, Socket } from "socket.io";
import { SocketData } from "../socket.types";
import { SOCKET_EVENTS } from "../socket.constants";
import { validatePayload, withErrorHandling } from "../socket.middleware";
import { ChatSchema, ChatDTO, TypingSchema, TypingDTO } from "@/validators/chat.validator";
import { chatService } from "@/services/chat.service";
import { createSuccessResponse } from "../socket.utils";

export const registerChatHandlers = (io: Server, socket: Socket<any, any, any, SocketData>) => {
  const userId = socket.data.user.id;

  socket.on(SOCKET_EVENTS.CHAT_SEND, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(ChatSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, content } = validated.data as ChatDTO;

      const message = await chatService.handleSendMessage(roomId, userId, content);

      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse(message));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.CHAT_TYPING, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(TypingSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, isTyping } = validated.data as TypingDTO;

      await chatService.handleTyping(roomId, userId, isTyping);

      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });
};
