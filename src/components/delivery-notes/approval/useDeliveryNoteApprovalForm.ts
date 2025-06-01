
import { useState, useEffect } from "react";
import { DeliveryNote } from "@/types/delivery-note";
import { useFetchWarehouses } from "@/hooks/delivery-notes/use-fetch-warehouses";
import { useFetchPOSLocations } from "@/hooks/use-pos-locations";
import { deliveryNoteApprovalService } from "./services/deliveryNoteApprovalService";
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
        if (item && item.id) {
          console.log("Setting initial quantity for item:", item.id, "quantity:", item.quantity_ordered);
          initialQuantities[item.id] = item.quantity_ordered || 0;
        } else {
          console.warn("Item without id found:", item);
        }
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
    console.log("Starting form validation...");
    const newErrors: string[] = [];

    if (!selectedLocationId) {
      newErrors.push("Veuillez sélectionner un emplacement de stockage");
      console.log("Validation error: No location selected");
    } else {
      console.log("Location selected:", selectedLocationId);
    }

    if (!note?.items || !Array.isArray(note.items) || note.items.length === 0) {
      newErrors.push("Aucun article trouvé dans ce bon de livraison");
      console.log("Validation error: No items found");
      setErrors(newErrors);
      return false;
    }

    console.log("Validating items...");
    note.items.forEach((item, index) => {
      if (!item || !item.id) {
        newErrors.push(`Article ${index + 1} invalide (ID manquant)`);
        console.log("Validation error: Item missing ID:", item);
        return;
      }

      const receivedQty = receivedQuantities[item.id] || 0;
      const orderedQty = item.quantity_ordered || 0;
      
      console.log(`Item ${item.id}: received=${receivedQty}, ordered=${orderedQty}`);
      
      if (receivedQty > orderedQty) {
        const productName = item.product?.name || `Article ${item.id}`;
        newErrors.push(`La quantité reçue pour ${productName} ne peut pas dépasser la quantité commandée (${orderedQty})`);
        console.log("Validation error: Received quantity exceeds ordered quantity for item:", item.id);
      }
    });

    console.log("Validation completed. Errors:", newErrors);
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleApprove = async () => {
    console.log("=== STARTING APPROVAL PROCESS ===");
    console.log("Current note:", note);
    console.log("Current receivedQuantities:", receivedQuantities);
    console.log("Current selectedLocationId:", selectedLocationId);
    console.log("Warehouses available:", warehouses);
    console.log("POS locations available:", posLocations);
    
    if (!note) {
      console.error("No note provided for approval");
      toast.error("Aucun bon de livraison sélectionné");
      return;
    }
    
    console.log("Running form validation...");
    const isValid = validateForm();
    console.log("Form validation result:", isValid);
    
    if (!isValid) {
      console.log("Form validation failed, stopping approval process");
      toast.error("Veuillez corriger les erreurs avant de continuer");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("=== CALLING APPROVAL SERVICE ===");
      await deliveryNoteApprovalService.approveDeliveryNote(
        note,
        receivedQuantities,
        selectedLocationId,
        warehouses,
        posLocations
      );

      console.log("=== APPROVAL COMPLETED SUCCESSFULLY ===");
      toast.success("Bon de livraison approuvé avec succès. La facture d'achat sera générée automatiquement.");
      onApprovalComplete();
      onClose();
    } catch (error: any) {
      console.error('=== APPROVAL FAILED ===');
      console.error('Error details:', error);
      toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
      console.log("=== APPROVAL PROCESS FINISHED ===");
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
