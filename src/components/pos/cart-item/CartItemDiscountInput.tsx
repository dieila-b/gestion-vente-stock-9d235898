
import { Input } from "@/components/ui/input";
import { DiscountInputProps } from "./CartItemTypes";

export function CartItemDiscountInput({
  discountValue,
  onDiscountChange,
}: DiscountInputProps) {
  return (
    <div className="space-y-1">
      <Input
        type="number"
        min="0"
        step="0.01"
        className="h-8 text-sm"
        value={discountValue}
        onChange={onDiscountChange}
        placeholder="0"
      />
      <div className="text-xs text-muted-foreground text-center">
        GNF
      </div>
    </div>
  );
}
