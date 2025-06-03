
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
    console.log("useDeliveryNoteApprovalForm - note changed:", note);
    console.log("useDeliveryNoteApprovalForm - note items:", note?.items);
    
    if (note?.items && Array.isArray(note.items)) {
      const initialQuantities: Record<string, number> = {};
      note.items.forEach(item => {
        console.log("Setting initial quantity for item:", item.id, "quantity:", item.quantity_ordered);
        initialQuantities[item.id] = item.quantity_ordered;
      });
      console.log("Initial quantities set:", initialQuantities);
      setReceivedQuantities(initialQuantities);
    } else {
      console.log("No items found or items is not an array");
      setReceivedQuantities({});
    }
    
    setSelectedLocationId("");
    setErrors([]);
  }, [note]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    console.log("Quantity changed for item:", itemId, "new value:", numValue);
    setReceivedQuantities(prev => ({ ...prev, [itemId]: numValue }));
    setErrors([]);
  };

  const handleLocationChange = (locationId: string) => {
    console.log("Location changed:", locationId);
    setSelectedLocationId(locationId);
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!selectedLocationId) {
      newErrors.push("Veuillez sélectionner un emplacement de stockage");
    }

    if (!note?.items || !Array.isArray(note.items) || note.items.length === 0) {
      newErrors.push("Aucun article trouvé dans ce bon de livraison");
      setErrors(newErrors);
      return false;
    }

    note.items.forEach(item => {
      const receivedQty = receivedQuantities[item.id] || 0;
      if (receivedQty > item.quantity_ordered) {
        newErrors.push(`La quantité reçue pour ${item.product?.name || 'Article'} ne peut pas dépasser la quantité commandée (${item.quantity_ordered})`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleApprove = async () => {
    console.log("handleApprove called");
    console.log("Current note:", note);
    console.log("Current receivedQuantities:", receivedQuantities);
    console.log("Current selectedLocationId:", selectedLocationId);
    
    if (!note || !validateForm()) {
      console.log("Validation failed");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Calling stockUpdateService.approveDeliveryNote...");
      await stockUpdateService.approveDeliveryNote(
        note,
        receivedQuantities,
        selectedLocationId,
        warehouses,
        posLocations
      );

      console.log("Approval completed successfully");
      toast.success("Bon de livraison approuvé avec succès");
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
