type InlineAlertProps = {
  message: string;
  tone?: 'error' | 'info';
};

// InlineAlert, form ve panel icindeki kisa bilgi veya hata mesajlarini ortak gorunumle sunar.
export default function InlineAlert({ message, tone = 'error' }: InlineAlertProps) {
  const toneClasses =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-stone-200 bg-stone-50 text-stone-600';

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses}`}>{message}</div>;
}
