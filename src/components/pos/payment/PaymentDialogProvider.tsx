
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PaymentDialogContent } from "./PaymentDialogContent";

interface CartItemInfo {
  id: string;
  name: string;
  quantity: number;
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onSubmitPayment: (
    amount: number, 
    method: string, 
    notes?: string, 
    delivered?: boolean, 
    partiallyDelivered?: boolean,
    deliveredItems?: Record<string, { delivered: boolean, quantity: number }>
  ) => void;
  items: CartItemInfo[];
  client?: any;
  isAlreadyPaid?: boolean;
  showDeliveryTabByDefault?: boolean;
  showPaymentTabByDefault?: boolean;
  fullyDeliveredByDefault?: boolean;
}

export function PaymentDialogProvider({ 
  isOpen, 
  onClose, 
  totalAmount, 
  onSubmitPayment, 
  items,
  client,
  isAlreadyPaid,
  showDeliveryTabByDefault,
  showPaymentTabByDefault,
  fullyDeliveredByDefault
}: PaymentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[600px] p-0 md:max-h-[90vh] overflow-auto">
        <PaymentDialogContent
          totalAmount={totalAmount}
          onClose={onClose}
          onSubmitPayment={onSubmitPayment}
          items={items}
          client={client}
          isAlreadyPaid={isAlreadyPaid}
          showDeliveryTabByDefault={showDeliveryTabByDefault}
          showPaymentTabByDefault={showPaymentTabByDefault}
          fullyDeliveredByDefault={fullyDeliveredByDefault}
        />
      </DialogContent>
    </Dialog>
  );
}
