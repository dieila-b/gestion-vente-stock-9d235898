
import { ShoppingCart } from "lucide-react";

interface CartHeaderProps {
  itemCount: number;
}

export function CartHeader({ itemCount }: CartHeaderProps) {
  return (
    <div className="p-4 border-b border-white/10">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <ShoppingCart className="h-5 w-5" />
        Panier ({itemCount})
      </div>
    </div>
  );
}
