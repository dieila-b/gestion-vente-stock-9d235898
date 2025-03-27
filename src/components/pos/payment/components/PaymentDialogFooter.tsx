
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentDialogFooterProps {
  onClose: () => void;
  onSubmit: () => void;
  activeTab: string;
}

export function PaymentDialogFooter({ onClose, onSubmit, activeTab }: PaymentDialogFooterProps) {
  // Determine submit button text based on active tab
  const submitButtonText = activeTab === "delivery" 
    ? "Valider la livraison" 
    : "Valider le paiement";
    
  return (
    <DialogFooter className="bg-gray-950 border-t border-gray-800 px-4 py-3">
      <Button variant="outline" onClick={onClose} className="bg-transparent text-gray-300 border-gray-700 hover:bg-gray-800">
        Annuler
      </Button>
      <Button onClick={onSubmit} className="bg-purple-600 hover:bg-purple-700 text-white">
        {submitButtonText}
      </Button>
    </DialogFooter>
  );
}
