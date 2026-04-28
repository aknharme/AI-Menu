type InlineAlertProps = {
  message: string;
};

// InlineAlert, sepet ve prompt gibi kucuk alanlarda tek satirlik hata bilgisini ortak stil ile gosterir.
export default function InlineAlert({ message }: InlineAlertProps) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}
