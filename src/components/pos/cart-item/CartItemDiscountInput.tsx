
import { Input } from "@/components/ui/input";
import { DiscountInputProps } from "./CartItemTypes";

export function CartItemDiscountInput({
  discountValue,
  onDiscountChange,
}: DiscountInputProps) {
  return (
    <div className="col-span-2 text-left">
      <Input
        type="number"
        min="0"
        className="h-7 w-28 text-left"
        value={discountValue}
        onChange={onDiscountChange}
      />
    </div>
  );
}
