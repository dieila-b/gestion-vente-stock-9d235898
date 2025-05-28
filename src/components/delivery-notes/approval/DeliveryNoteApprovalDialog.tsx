
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DeliveryNote } from "@/types/delivery-note";
import { ApprovalDialogHeader } from "./ApprovalDialogHeader";
import { ApprovalDialogContent } from "./ApprovalDialogContent";
import { ApprovalDialogFooter } from "./ApprovalDialogFooter";
import { useDeliveryNoteApprovalForm } from "./useDeliveryNoteApprovalForm";

interface DeliveryNoteApprovalDialogProps {
  note: DeliveryNote | null;
  open: boolean;
  onClose: () => void;
  onApprovalComplete: () => void;
}

export function DeliveryNoteApprovalDialog({
  note,
  open,
  onClose,
  onApprovalComplete
}: DeliveryNoteApprovalDialogProps) {
  const {
    receivedQuantities,
    selectedLocationId,
    errors,
    isSubmitting,
    handleQuantityChange,
    handleLocationChange,
    handleApprove
  } = useDeliveryNoteApprovalForm(note, onClose, onApprovalComplete);

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <ApprovalDialogHeader note={note} />
        <ApprovalDialogContent
          note={note}
          receivedQuantities={receivedQuantities}
          selectedLocationId={selectedLocationId}
          errors={errors}
          onQuantityChange={handleQuantityChange}
          onLocationChange={handleLocationChange}
        />
        <ApprovalDialogFooter
          isSubmitting={isSubmitting}
          onClose={onClose}
          onApprove={handleApprove}
        />
      </DialogContent>
    </Dialog>
  );
}
