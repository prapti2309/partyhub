import { chatApi } from "./api/chat.api";
import { ChatMessage } from "@/types";
import { MOCK_CHAT } from "../utils/mock-data";

export const chatService = {
  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    try {
      const response = await chatApi.getMessages(roomId);
      return response.data;
    } catch (e) {
      // Return filtered mock chat messages
      return MOCK_CHAT.filter((msg) => msg.roomId === roomId);
    }
  },

  postMessage: async (roomId: string, content: string): Promise<ChatMessage> => {
    try {
      const response = await chatApi.postMessage(roomId, content);
      return response.data;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return {
        id: "msg-mock-" + Math.random().toString(36).substring(2, 9),
        roomId,
        userId: "user-current",
        username: "neon_nova",
        content,
        pinned: false,
        createdAt: new Date().toISOString(),
        reactions: [],
      };
    }
  },

  togglePin: async (messageId: string): Promise<boolean> => {
    try {
      const response = await chatApi.togglePin(messageId);
      return response.data.pinned;
    } catch (e) {
      return true; // Toggle mock status
    }
  },
};
