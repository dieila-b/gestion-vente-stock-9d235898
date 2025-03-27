
import { PaymentDialogProvider } from "./payment/PaymentDialogProvider";

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

export function PaymentDialog(props: PaymentDialogProps) {
  return <PaymentDialogProvider {...props} />;
}
