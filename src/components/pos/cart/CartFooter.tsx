
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
    <div className="fixed bottom-0 right-0 w-full lg:w-[55%] xl:w-[50%] bg-card/98 backdrop-blur-md border-t border-border z-50 shadow-2xl">
      <div className="p-3 lg:p-4 space-y-3">
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
