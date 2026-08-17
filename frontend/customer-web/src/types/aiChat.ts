export type AiChatResponse = {
  response: string;
  source: string;
  usedModel: boolean;
};

export type AiChatMessage = {
  id: string;
  role: 'assistant' | 'customer';
  text: string;
};
