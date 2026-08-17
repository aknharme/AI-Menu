import { FormEvent, useEffect, useRef, useState } from 'react';
import { sendAiChatMessage } from '../services/aiChatService';
import type { AiChatMessage } from '../types/aiChat';

type AiWaiterChatProps = {
  restaurantId?: string;
};

const initialMessages: AiChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Merhaba! Menü hakkında soru sorabilir veya damak zevkinize göre öneri isteyebilirsiniz.',
  },
];

function createMessage(role: AiChatMessage['role'], text: string): AiChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
  };
}

export default function AiWaiterChat({ restaurantId }: AiWaiterChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, isSending, messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedMessage = message.trim();
    if (!restaurantId || !normalizedMessage || isSending) {
      return;
    }

    setMessages((current) => [...current, createMessage('customer', normalizedMessage)]);
    setMessage('');
    setIsSending(true);

    try {
      const response = await sendAiChatMessage(restaurantId, normalizedMessage);
      setMessages((current) => [
        ...current,
        createMessage('assistant', response.response),
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        createMessage(
          'assistant',
          'Şu anda yapay zekâ garsona ulaşılamıyor. Lütfen kısa bir süre sonra tekrar deneyin.',
        ),
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Yapay zekâ garsonu aç"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[max(1rem,calc((100vw-28rem)/2+1rem))] z-30 flex h-14 items-center gap-2 rounded-full border border-[#d8b95f] bg-[#14351f] px-4 text-sm font-semibold text-[#f8efd9] shadow-lg shadow-black/30 active:scale-[0.98]"
      >
        <span aria-hidden="true" className="text-xl">✦</span>
        AI Garson
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1d10]/70 sm:items-center sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Yapay zekâ garson sohbeti"
            className="flex h-[min(78vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] bg-[#fff8e9] shadow-2xl sm:rounded-[28px]"
          >
            <header className="flex items-center justify-between border-b border-[#d8c998] bg-[#14351f] px-4 py-3 text-[#f8efd9]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#d8b95f]">Menü Asistanı</p>
                <h2 className="text-lg font-semibold">Yapay Zekâ Garson</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Sohbeti kapat"
                className="rounded-full border border-[#d8b95f]/60 px-3 py-2 text-sm font-semibold"
              >
                Kapat
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.map((chatMessage) => (
                <div
                  key={chatMessage.id}
                  className={chatMessage.role === 'customer' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <p
                    className={[
                      'max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                      chatMessage.role === 'customer'
                        ? 'rounded-br-md bg-[#14351f] text-[#f8efd9]'
                        : 'rounded-bl-md border border-[#dfd2aa] bg-white text-[#243d2b]',
                    ].join(' ')}
                  >
                    {chatMessage.text}
                  </p>
                </div>
              ))}
              {isSending ? (
                <div className="flex justify-start">
                  <p className="rounded-2xl rounded-bl-md border border-[#dfd2aa] bg-white px-4 py-3 text-sm text-[#52624a]">
                    Menü inceleniyor…
                  </p>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-[#d8c998] bg-[#f4ead4] p-3">
              {!restaurantId ? (
                <p className="mb-2 text-xs font-semibold text-red-700">
                  Restoran bilgisi bulunamadığı için sohbet başlatılamıyor.
                </p>
              ) : null}
              <div className="flex items-end gap-2">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  rows={1}
                  maxLength={500}
                  disabled={!restaurantId || isSending}
                  placeholder="Örn: Hafif ne önerirsin?"
                  className="max-h-28 min-h-12 flex-1 resize-none rounded-2xl border border-[#d8c998] bg-white px-4 py-3 text-sm text-[#14351f] outline-none focus:border-[#b3903f] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!restaurantId || !message.trim() || isSending}
                  className="h-12 rounded-2xl bg-[#14351f] px-4 text-sm font-semibold text-[#f8efd9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Gönder
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
