import api from './api';
import type { AiChatResponse } from '../types/aiChat';

export async function sendAiChatMessage(restaurantId: string, message: string) {
  const response = await api.post<AiChatResponse>(`/ai/${restaurantId}/chat`, {
    message,
  });

  return response.data;
}
