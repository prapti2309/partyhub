import { apiClient } from "./client";
import { ChatMessage } from "@/types";

export const chatApi = {
  getMessages: (roomId: string) => apiClient.get<ChatMessage[]>(`/rooms/${roomId}/chat`),

  postMessage: (roomId: string, content: string) =>
    apiClient.post<ChatMessage>(`/rooms/${roomId}/chat`, { content }),

  togglePin: (messageId: string) => apiClient.patch<{ pinned: boolean }>(`/chat/${messageId}/pin`),
};
