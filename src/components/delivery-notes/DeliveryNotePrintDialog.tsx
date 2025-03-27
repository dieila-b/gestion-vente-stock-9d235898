
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DeliveryNote } from "@/types/delivery-note";
import { DeliveryNoteActions } from "./print/DeliveryNoteActions";
import { DeliveryNotePrintContent } from "./print/DeliveryNotePrintContent";
import { useDeliveryNotePrint } from "./print/useDeliveryNotePrint";

interface DeliveryNotePrintDialogProps {
  note: DeliveryNote | null;
  onClose: () => void;
}

export function DeliveryNotePrintDialog({ note, onClose }: DeliveryNotePrintDialogProps) {
  // Return early if no note is provided
  if (!note) return null;
  
  const { printRef, calculateSubtotal } = useDeliveryNotePrint(note);
  const subtotal = calculateSubtotal();

  return (
    <Dialog open={!!note} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white text-black">
          <DeliveryNoteActions 
            note={note} 
            printContentRef={printRef} 
          />
          
          <DeliveryNotePrintContent 
            note={note} 
            subtotal={subtotal} 
            printRef={printRef} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
