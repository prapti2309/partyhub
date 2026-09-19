import { chatApi } from "./api/chat.api";
import { ChatMessage } from "@/types";

export const chatService = {
  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    try {
      const response = await chatApi.getMessages(roomId);
      return response.data || [];
    } catch (e) {
      return [];
    }
  },

  postMessage: async (roomId: string, content: string): Promise<ChatMessage> => {
    const response = await chatApi.postMessage(roomId, content);
    return response.data;
  },

  togglePin: async (messageId: string): Promise<boolean> => {
    const response = await chatApi.togglePin(messageId);
    return response.data.pinned;
  },
};
