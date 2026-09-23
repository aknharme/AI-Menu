import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { chatWithWaiter, type ChatMessage } from '../services/aiService';

type Props = { restaurantId: string };
const suggestions = ['Merhaba', 'Cola var mı?', 'Ne önerirsiniz?'];

function ChatIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path d="M20 11.5a8 8 0 0 1-8 8H5l-4 3 2-6a8 8 0 1 1 17-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7 11h.01M12 11h.01M17 11h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>;
}

export default function AiWaiterChat({ restaurantId }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      inputRef.current?.focus();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending, error, open]);

  useEffect(() => {
    if (open && !pending) inputRef.current?.focus();
  }, [open, pending]);

  useEffect(() => () => requestRef.current?.abort(), []);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  async function send(value: string) {
    const message = value.trim();
    if (!message || message.length > 1000 || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setPending(message);
    setDraft('');
    setError(null);
    try {
      const reply = await chatWithWaiter(restaurantId, message, messages, controller.signal);
      if (controller.signal.aborted) return;
      if (reply.source === 'not_configured' || reply.source === 'unavailable' || reply.source === 'fallback') {
        setError(reply.response);
        setDraft(message);
        return;
      }
      setMessages(previous => [...previous,
        { role: 'user', content: message } as ChatMessage,
        { role: 'assistant', content: reply.response } as ChatMessage,
      ].slice(-40));
    } catch (reason) {
      if (controller.signal.aborted) return;
      const status = axios.isAxiosError(reason) ? reason.response?.status : undefined;
      setError(status === 429
        ? 'Biraz hızlı yazıştık. Yaklaşık bir dakika sonra tekrar deneyebilirsiniz.'
        : status === 404
          ? 'Bu restoranın menüsüne ulaşılamıyor. Lütfen restoranın QR kodunu yeniden açın.'
          : 'Garsona şu an ulaşılamıyor. Bağlantınızı kontrol edip tekrar deneyin.');
      setDraft(message);
    } finally {
      if (!controller.signal.aborted) {
        requestRef.current = null;
        setPending('');
        inputRef.current?.focus();
      }
    }
  }

  return <>
    <button ref={triggerRef} type="button" onClick={() => setOpen(true)}
      aria-label="Yapay zekâ garsonla konuş" aria-haspopup="dialog" aria-expanded={open}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[max(1rem,calc((100vw-28rem)/2+1rem))] z-30 flex h-14 items-center gap-2 rounded-full border border-[#d8b95f] bg-[#14351f] px-3 text-xs font-semibold text-[#fff8e9] shadow-lg hover:bg-[#234b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b3903f]">
      <ChatIcon /><span>AI Garson</span>
    </button>
    <dialog ref={dialogRef} aria-labelledby="waiter-title" onCancel={close} onClose={close}
      onClick={event => { if (event.target === event.currentTarget) close(); }}
      className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] top-auto m-auto w-[calc(100%-1.5rem)] max-w-[420px] overflow-hidden rounded-[28px] border border-[#d8b95f] bg-[#fff8e9] p-0 text-[#14351f] shadow-2xl backdrop:bg-[#0b1d10]/60">
      <div className="flex h-[min(650px,85dvh)] flex-col">
        <header className="flex shrink-0 items-center gap-3 bg-[#14351f] px-5 py-4 text-[#fff8e9]">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#d8b95f]/60 text-[#d8b95f]"><ChatIcon /></span>
          <div className="flex-1"><h2 id="waiter-title" className="text-lg font-semibold">AI Garson</h2>
            <p className="text-xs text-[#e2d6b7]">Menü için küçük bir yardım</p></div>
          <button type="button" onClick={close} aria-label="Sohbeti kapat" className="rounded-full px-3 py-2 text-xl hover:bg-white/10">×</button>
        </header>
        <div ref={scrollRef} role="log" aria-live="polite" aria-label="Garson ile konuşma" className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5">
          <div className="mr-7 rounded-2xl rounded-tl-sm border border-[#e4d5ae] bg-white p-3.5 text-sm leading-relaxed">
            Hoş geldiniz! Ben yapay zekâ garsonunuzum. Menüden bir şey seçelim mi? Damak zevkinizi veya bütçenizi söyleyebilirsiniz.
          </div>
          {messages.map((message, index) => <div key={index}
            className={`whitespace-pre-wrap break-words rounded-2xl p-3.5 text-sm leading-relaxed ${message.role === 'user'
              ? 'ml-7 rounded-tr-sm bg-[#14351f] text-[#fff8e9]'
              : 'mr-7 rounded-tl-sm border border-[#e4d5ae] bg-white'}`}>
            <span className="sr-only">{message.role === 'user' ? 'Siz: ' : 'Garson: '}</span>{message.content}
          </div>)}
          {pending && <>
            <div className="ml-7 whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-[#14351f] p-3.5 text-sm text-[#fff8e9]">{pending}</div>
            <p role="status" className="text-xs text-[#52624a]">Garson yanıt hazırlıyor…</p>
          </>}
          {error && <div role="alert" className="rounded-2xl border border-[#d8b95f] bg-[#f4ead4] p-3 text-sm leading-relaxed">{error}</div>}
        </div>
        <footer className="shrink-0 border-t border-[#e4d5ae] bg-[#fff8e9] px-4 pb-4 pt-3">
          {messages.length === 0 && <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map(text => <button key={text} type="button" disabled={!!pending} onClick={() => void send(text)}
              className="rounded-full border border-[#d8c998] px-3 py-2 text-xs hover:bg-[#f4ead4] disabled:opacity-50">{text}</button>)}
          </div>}
          <form onSubmit={event => { event.preventDefault(); void send(draft); }} className="flex items-end gap-2">
            <label className="flex-1"><span className="sr-only">Garsona mesajınız</span>
              <textarea ref={inputRef} value={draft} onChange={event => setDraft(event.target.value)} maxLength={1000} rows={2}
                disabled={!!pending} placeholder="Örneğin: Hafif bir şey yemek istiyorum"
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault(); void send(draft);
                  }
                }}
                className="block w-full resize-none rounded-2xl border border-[#d8c998] bg-white p-3 text-sm outline-none focus:border-[#14351f] focus:ring-1 focus:ring-[#14351f] disabled:opacity-60" />
            </label>
            <button type="submit" disabled={!!pending || !draft.trim()} className="rounded-2xl bg-[#14351f] px-4 py-3 text-sm text-white disabled:opacity-40">Gönder</button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#52624a]">
            <span>Alerjiler için personelimizden teyit alın.</span>
            <span>{draft.length}/1000</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[#52624a]">
            <span>Siparişinizi sepetten onaylayın.</span>
            <button type="button" disabled={!!pending} onClick={() => { setMessages([]); setError(null); setDraft(''); }}
              className="shrink-0 underline underline-offset-2 disabled:opacity-50">Sohbeti temizle</button>
          </div>
        </footer>
      </div>
    </dialog>
  </>;
}
