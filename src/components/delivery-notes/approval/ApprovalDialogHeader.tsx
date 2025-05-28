
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { DeliveryNote } from "@/types/delivery-note";

interface ApprovalDialogHeaderProps {
  note: DeliveryNote;
}

export function ApprovalDialogHeader({ note }: ApprovalDialogHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Check className="h-5 w-5 text-green-600" />
        Approbation du bon de livraison {note.delivery_number}
      </DialogTitle>
    </DialogHeader>
  );
}
