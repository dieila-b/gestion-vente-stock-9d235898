
import { formatGNF } from "@/lib/currency";
import { Client } from "@/types/client";

interface CartSummaryProps {
  subtotal: number;
  totalDiscount: number;
  total: number;
  selectedClient: Client | null;
}

export function CartSummary({ subtotal, totalDiscount, total, selectedClient }: CartSummaryProps) {
  return (
    <div className="space-y-2">
      {selectedClient && (
        <div className="text-sm text-muted-foreground">
          Client: {selectedClient.company_name || selectedClient.contact_name}
        </div>
      )}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Sous-total</span>
          <span>{formatGNF(subtotal)}</span>
        </div>
        {totalDiscount > 0 && (
          <div className="flex justify-between items-center text-sm text-red-400">
            <span>Remises</span>
            <span>-{formatGNF(totalDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total</span>
          <span className="text-gradient">{formatGNF(total)}</span>
        </div>
      </div>
    </div>
  );
}
