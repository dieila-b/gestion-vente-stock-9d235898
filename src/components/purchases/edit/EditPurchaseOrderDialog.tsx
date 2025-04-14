
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PurchaseOrderEditForm } from "./PurchaseOrderEditForm";

interface EditPurchaseOrderDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
}

export function EditPurchaseOrderDialog({ open, onClose, orderId }: EditPurchaseOrderDialogProps) {
  if (!orderId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Modifier Bon de Commande</DialogTitle>
        <PurchaseOrderEditForm orderId={orderId} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
