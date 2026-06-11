type CartButtonProps = {
  itemCount: number;
  totalPriceLabel: string;
  label?: string;
  summary?: string;
  onClick: () => void;
};

export default function CartButton({
  itemCount,
  totalPriceLabel,
  label = 'Sepet',
  summary,
  onClick,
}: CartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-between gap-2 rounded-[22px] border border-[#d8b95f] bg-[#14351f]/95 px-3 py-2 text-sm font-semibold text-[#f8efd9] shadow-xl shadow-black/30 backdrop-blur active:scale-[0.98]"
    >
      <span className="min-w-0 overflow-hidden pl-1">
        <span className="block text-[10px] font-semibold uppercase text-[#d8b95f]">{label}</span>
        <span className="block truncate overflow-hidden whitespace-nowrap text-[14px] font-semibold leading-tight">
          {summary ?? `${itemCount} ürün`}
        </span>
      </span>
      <span className="ml-auto min-w-[74px] shrink-0 overflow-hidden rounded-2xl bg-[#e7f0df] px-3 py-2 text-center text-[14px] font-semibold text-[#14351f] shadow-sm ring-1 ring-[#cfe0c6]">
        <span className="block truncate overflow-hidden whitespace-nowrap">{totalPriceLabel}</span>
      </span>
    </button>
  );
}
