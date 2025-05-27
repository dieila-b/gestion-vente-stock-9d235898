
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface QuantityControlsProps {
  quantity: number;
  quantityValue: string;
  hasQuantityError: boolean;
  availableStock: number;
  onUpdateQuantity: (delta: number) => void;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityBlur: () => void;
  onQuantityKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSetHasQuantityError: (hasError: boolean) => void;
}

export function QuantityControls({
  quantity,
  quantityValue,
  hasQuantityError,
  availableStock,
  onUpdateQuantity,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyDown,
  onSetHasQuantityError,
}: QuantityControlsProps) {
  const handleQuantityIncrease = () => {
    if (quantity >= availableStock) {
      toast.error("La quantité demandée dépasse le stock disponible pour cet article.");
      return;
    }
    onUpdateQuantity(1);
  };

  const handleQuantityDecrease = () => {
    if (quantity <= 1) return;
    onUpdateQuantity(-1);
    onSetHasQuantityError(false); // Clear error when decreasing
  };

  return (
    <div className="col-span-2 flex items-center text-left space-x-1">
      <button
        className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-sm hover:bg-primary/20 transition-colors"
        onClick={handleQuantityDecrease}
        disabled={quantity <= 1}
      >
        -
      </button>
      <Input
        type="number"
        min="1"
        max={availableStock}
        className={`h-7 w-16 text-center text-sm ${
          hasQuantityError ? 'border-red-500 bg-red-50' : ''
        }`}
        value={quantityValue}
        onChange={onQuantityChange}
        onBlur={onQuantityBlur}
        onKeyDown={onQuantityKeyDown}
      />
      <button
        className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-sm hover:bg-primary/20 transition-colors"
        onClick={handleQuantityIncrease}
        disabled={quantity >= availableStock}
      >
        +
      </button>
    </div>
  );
}
