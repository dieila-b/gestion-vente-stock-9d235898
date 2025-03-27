
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PaymentDialogHeaderProps {
  activeTab: string;
}

export function PaymentDialogHeader({ activeTab }: PaymentDialogHeaderProps) {
  return (
    <DialogHeader className="bg-gray-950 text-white border-b border-gray-800 py-4">
      <DialogTitle>
        {activeTab === "delivery" ? "Mise à jour de la livraison" : "Paiement"}
      </DialogTitle>
    </DialogHeader>
  );
}
