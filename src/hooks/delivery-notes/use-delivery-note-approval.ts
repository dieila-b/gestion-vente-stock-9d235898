
import { useState } from "react";
import { DeliveryNote } from "@/types/delivery-note";

export function useDeliveryNoteApproval() {
  const [selectedNoteForApproval, setSelectedNoteForApproval] = useState<DeliveryNote | null>(null);

  const handleApprove = (id: string, deliveryNotes: DeliveryNote[]) => {
    const note = deliveryNotes.find(n => n.id === id);
    if (note) {
      setSelectedNoteForApproval(note);
    }
  };

  const closeApprovalDialog = () => {
    setSelectedNoteForApproval(null);
  };

  const onApprovalComplete = (refetch: () => void) => {
    refetch();
    setSelectedNoteForApproval(null);
  };

  return {
    selectedNoteForApproval,
    handleApprove,
    closeApprovalDialog,
    onApprovalComplete
  };
}
