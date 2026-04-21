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
      className="inline-flex items-center gap-3 rounded-full border border-stone-900 bg-stone-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-stone-950/20"
    >
      <span className="rounded-full bg-white/15 px-2 py-1 text-xs">{itemCount} ürün</span>
      <span>{totalPriceLabel}</span>
    </button>
  );
}
