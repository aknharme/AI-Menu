type CartButtonProps = {
  itemCount: number;
  totalPriceLabel: string;
  onClick: () => void;
};

export default function CartButton({ itemCount, totalPriceLabel, onClick }: CartButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-center justify-between gap-1.5 rounded-[22px] border border-stone-900 bg-stone-950 px-2.5 py-2 text-sm font-semibold text-white shadow-xl shadow-stone-950/25"
    >
      <span className="min-w-0 max-w-[66px] overflow-hidden pl-1">
        <span className="block text-[9px] uppercase tracking-[0.18em] text-white/55">Sepet</span>
        <span className="block truncate overflow-hidden whitespace-nowrap text-[14px] font-bold leading-tight">
          {itemCount} ürün
        </span>
      </span>
      <span className="ml-auto min-w-[64px] max-w-[74px] shrink-0 overflow-hidden rounded-full bg-white px-2.5 py-1.5 text-center text-[14px] font-black text-stone-950">
        <span className="block truncate overflow-hidden whitespace-nowrap">{totalPriceLabel}</span>
      </span>
    </button>
  );
}
