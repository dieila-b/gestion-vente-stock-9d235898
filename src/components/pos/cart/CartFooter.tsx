
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
  // Ce composant n'est plus utilisé car le footer est maintenant intégré dans CartContainer
  // On le garde pour la compatibilité mais il ne rend rien
  return null;
}
