
import { useState, useEffect } from "react";
import { DeliveryNote } from "@/types/delivery-note";
import { useFetchWarehouses } from "@/hooks/delivery-notes/use-fetch-warehouses";
import { useFetchPOSLocations } from "@/hooks/use-pos-locations";
import { stockUpdateService } from "./stockUpdateService";
import { toast } from "sonner";

export function useDeliveryNoteApprovalForm(
  note: DeliveryNote | null,
  onClose: () => void,
  onApprovalComplete: () => void
) {
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses = [] } = useFetchWarehouses();
  const { data: posLocations = [] } = useFetchPOSLocations();

  useEffect(() => {
    if (note?.items) {
      const initialQuantities: Record<string, number> = {};
      note.items.forEach(item => {
        initialQuantities[item.id] = item.quantity_ordered;
      });
      setReceivedQuantities(initialQuantities);
    }
    setSelectedLocationId("");
    setErrors([]);
  }, [note]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setReceivedQuantities(prev => ({ ...prev, [itemId]: numValue }));
    setErrors([]);
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!selectedLocationId) {
      newErrors.push("Veuillez sélectionner un emplacement de stockage");
    }

    if (!note?.items) {
      newErrors.push("Aucun article trouvé");
      setErrors(newErrors);
      return false;
    }

    note.items.forEach(item => {
      const receivedQty = receivedQuantities[item.id] || 0;
      if (receivedQty > item.quantity_ordered) {
        newErrors.push(`La quantité reçue pour ${item.product?.name} ne peut pas dépasser la quantité commandée (${item.quantity_ordered})`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleApprove = async () => {
    if (!note || !validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await stockUpdateService.approveDeliveryNote(
        note,
        receivedQuantities,
        selectedLocationId,
        warehouses,
        posLocations
      );

      toast.success("Bon de livraison approuvé, stocks mis à jour et facture d'achat créée");
      onApprovalComplete();
      onClose();
    } catch (error: any) {
      console.error('Error approving delivery note:', error);
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    receivedQuantities,
    selectedLocationId,
    errors,
    isSubmitting,
    handleQuantityChange,
    handleLocationChange,
    handleApprove
  };
}
