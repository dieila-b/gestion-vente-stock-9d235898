
import { Input } from "@/components/ui/input";

interface QuantityControlsProps {
  quantity: number;
  quantityInput: string;
  availableStock: number;
  onQuantityFocus: () => void;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityBlur: () => void;
  onQuantityKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onQuantityIncrease: () => void;
  onQuantityDecrease: () => void;
}

export function QuantityControls({
  quantity,
  quantityInput,
  availableStock,
  onQuantityFocus,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyDown,
  onQuantityIncrease,
  onQuantityDecrease,
}: QuantityControlsProps) {
  return (
    <div className="col-span-2 flex items-center text-left space-x-1">
      <button
        className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-sm hover:bg-primary/20 transition-colors"
        onClick={onQuantityDecrease}
        disabled={quantity <= 1}
      >
        -
      </button>
      <Input
        type="text"
        className="h-7 w-16 text-center text-sm"
        value={quantityInput}
        onChange={onQuantityChange}
        onFocus={onQuantityFocus}
        onBlur={onQuantityBlur}
        onKeyDown={onQuantityKeyDown}
        inputMode="numeric"
      />
      <button
        className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-sm hover:bg-primary/20 transition-colors"
        onClick={onQuantityIncrease}
        disabled={quantity >= availableStock}
      >
        +
      </button>
    </div>
  );
}
