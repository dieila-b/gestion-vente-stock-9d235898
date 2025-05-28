
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DeliveryNote } from "@/types/delivery-note";

export function useDeliveryNoteActions() {
  const navigate = useNavigate();

  const handleView = (id: string) => {
    navigate(`/delivery-notes/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/delivery-notes/${id}`);
  };

  const handlePrint = (id: string, deliveryNotes: DeliveryNote[]) => {
    const note = deliveryNotes.find(n => n.id === id);
    if (note) {
      // TODO: Implement print functionality
      toast.info("Fonctionnalité d'impression à implémenter");
    }
  };

  return {
    handleView,
    handleEdit,
    handlePrint
  };
}
