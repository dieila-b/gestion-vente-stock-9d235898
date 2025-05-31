
import { Input } from "@/components/ui/input";

interface DiscountInputProps {
  discountValue: string;
  onDiscountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showDiscount?: boolean;
}

export function DiscountInput({ 
  discountValue, 
  onDiscountChange, 
  showDiscount = false 
}: DiscountInputProps) {
  if (!showDiscount) {
    return <div className="col-span-2 text-left"></div>;
  }

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
