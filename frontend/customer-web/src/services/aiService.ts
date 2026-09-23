import api from './api';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type ChatReply = { response: string; source: string; usedModel: boolean };

// Aynı sınırlar backend'de de doğrulanır; eski mesajlar bütçeyi büyütmez.
export function boundedHistory(messages: ChatMessage[]): ChatMessage[] {
  const history: ChatMessage[] = [];
  let characters = 0;
  for (const message of messages.slice(-8).reverse()) {
    const content = message.content.slice(0, 1600);
    if (characters + content.length > 6000) break;
    history.unshift({ role: message.role, content });
    characters += content.length;
  }
  return history;
}

export async function chatWithWaiter(restaurantId: string, message: string, history: ChatMessage[], signal: AbortSignal) {
  const { data } = await api.post<ChatReply>(`/ai/${encodeURIComponent(restaurantId)}/chat`, {
    message,
    history: boundedHistory(history),
  }, { signal, timeout: 35000 });
  return data;
}
