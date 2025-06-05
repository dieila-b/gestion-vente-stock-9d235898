
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { QuantityControlsProps } from "./CartItemTypes";

export function CartItemQuantityControls({
  quantity,
  quantityInput,
  isEditing,
  availableStock,
  onQuantityFocus,
  onQuantityChange,
  onQuantityBlur,
  onQuantityKeyDown,
  onQuantityIncrease,
  onQuantityDecrease,
}: QuantityControlsProps) {
  return (
    <div className="flex items-center space-x-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 shrink-0"
        onClick={onQuantityDecrease}
        disabled={quantity <= 1}
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <Input
        type="text"
        className="h-8 w-16 text-center text-sm"
        value={quantityInput}
        onChange={onQuantityChange}
        onFocus={onQuantityFocus}
        onBlur={onQuantityBlur}
        onKeyDown={onQuantityKeyDown}
        inputMode="numeric"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 shrink-0"
        onClick={onQuantityIncrease}
        disabled={quantity >= availableStock}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
