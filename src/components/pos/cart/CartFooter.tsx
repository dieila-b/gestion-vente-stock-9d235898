
import { CartSummary } from "./CartSummary";
import { CartActions } from "./CartActions";
import { CartValidationAlert } from "./CartValidationAlert";
import { Client } from "@/types/client_unified";

interface CartFooterProps {
  hasValidationErrors: boolean;
  subtotal: number;
  totalDiscount: number;
  total: number;
  selectedClient: Client | null;
  showReceipt?: boolean;
  showInvoice?: boolean;
  onBack?: () => void;
  onClear?: () => void;
  onCheckout?: () => void;
  onPending?: () => void;
  onRestore?: () => void;
  isLoading?: boolean;
  itemCount: number;
}

export function CartFooter({
  hasValidationErrors,
  subtotal,
  totalDiscount,
  total,
  selectedClient,
  showReceipt,
  showInvoice,
  onBack,
  onClear,
  onCheckout,
  onPending,
  onRestore,
  isLoading,
  itemCount
}: CartFooterProps) {
  return (
    <div className="flex-shrink-0 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="p-4 space-y-4">
        <CartValidationAlert hasValidationErrors={hasValidationErrors} />
        
        <CartSummary
          subtotal={subtotal}
          totalDiscount={totalDiscount}
          total={total}
          selectedClient={selectedClient}
        />

        <div className="grid grid-cols-4 gap-2">
          <CartActions
            showReceipt={showReceipt}
            showInvoice={showInvoice}
            onBack={onBack}
            onClear={onClear}
            onCheckout={onCheckout}
            onPending={onPending}
            onRestore={onRestore}
            isLoading={isLoading}
            itemCount={itemCount}
            selectedClient={!!selectedClient}
          />
        </div>
      </div>
    </div>
  );
}
