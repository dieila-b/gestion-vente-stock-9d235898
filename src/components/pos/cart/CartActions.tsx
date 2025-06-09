
import { Button } from "@/components/ui/button";

interface CartActionsProps {
  showReceipt?: boolean;
  showInvoice?: boolean;
  onBack?: () => void;
  onClear?: () => void;
  onCheckout?: () => void;
  onPending?: () => void;
  onRestore?: () => void;
  isLoading?: boolean;
  itemCount: number;
  selectedClient?: boolean;
}

export function CartActions({
  showReceipt,
  showInvoice,
  onBack,
  onClear,
  onCheckout,
  onPending,
  onRestore,
  isLoading,
  itemCount,
  selectedClient
}: CartActionsProps) {
  // Show different buttons when viewing a receipt/invoice
  if (showReceipt || showInvoice) {
    return (
      <>
        <Button
          onClick={onBack}
          size="sm"
          variant="outline"
          className="col-span-4 text-xs sm:text-sm h-10 sm:h-11 font-medium"
        >
          Retour
        </Button>
      </>
    );
  }

  // Regular cart actions
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onClear}
        disabled={isLoading || itemCount === 0}
        className="col-span-2 text-xs h-10 sm:h-11"
      >
        Annuler
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRestore}
        disabled={isLoading}
        className="text-xs h-10 sm:h-11"
      >
        Restaurer
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onPending}
        disabled={isLoading || itemCount === 0}
        className="text-xs h-10 sm:h-11"
      >
        En attente
      </Button>
      <Button
        size="sm"
        onClick={onCheckout}
        disabled={isLoading || itemCount === 0 || !selectedClient}
        className="bg-primary col-span-4 text-sm sm:text-base h-12 sm:h-14 font-bold text-white hover:bg-primary/90 shadow-lg"
      >
        {isLoading ? "Chargement..." : "💳 PAIEMENT"}
      </Button>
    </>
  );
}
