
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";
import { validatePurchaseOrder } from "./utils/validate-purchase-order";
import { updatePurchaseOrderToApproved } from "./utils/update-purchase-order-status";
import { createDeliveryNote } from "./utils/create-delivery-note";
import { createDeliveryNoteItems } from "./utils/create-delivery-note-items";
import { constructPurchaseOrder } from "./utils/construct-purchase-order";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string): Promise<PurchaseOrder> => {
      try {
        console.log("Starting approval process for order:", id);
        
        // 1. Validate the order
        const orderCheck = await validatePurchaseOrder(id);
        
        // Check if order is already approved
        if (orderCheck.status === 'approved') {
          console.log("Order was already approved");
          toast.info("Ce bon de commande est déjà approuvé");
          
          // Construct minimal object for already approved orders
          return constructPurchaseOrder({ 
            id: orderCheck.id,
            status: orderCheck.status,
            delivery_note_created: false // Default to false as we don't know
          });
        }
        
        // 2. Update purchase order status
        const updatedOrder = await updatePurchaseOrderToApproved(id);
        console.log("Order updated to approved:", updatedOrder);
        
        // Track if a delivery note was successfully created
        let deliveryNoteCreated = false;
        
        try {
          // 3. Create delivery note
          const deliveryNote = await createDeliveryNote(updatedOrder);
          console.log("Delivery note created:", deliveryNote?.id);
          
          if (deliveryNote && deliveryNote.id) {
            // 4. Create delivery note items
            await createDeliveryNoteItems(deliveryNote.id, id);
            console.log("Delivery note items created successfully");
            deliveryNoteCreated = true;
          } else {
            console.warn("Delivery note creation returned an incomplete result");
          }
        } catch (deliveryError) {
          console.error("Error creating delivery note or items:", deliveryError);
          // Continue execution - we'll still mark the order as approved
          // But delivery_note_created will remain false
        }
        
        // 5. Refresh affected queries
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        if (deliveryNoteCreated) {
          await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        }
        
        // 6. Show appropriate toast notification
        if (deliveryNoteCreated) {
          toast.success("Bon de commande approuvé et bon de livraison créé");
        } else {
          toast.success("Bon de commande approuvé");
          toast.warning("Création du bon de livraison échouée");
        }
        
        // 7. Construct the return object with proper delivery_note_created value
        const result = constructPurchaseOrder({ 
          ...updatedOrder, 
          delivery_note_created: deliveryNoteCreated
        });
        
        console.log("Final return object:", result);
        return result;
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        toast.error(`Erreur lors de l'approbation: ${error.message || "Erreur inconnue"}`);
        throw error;
      }
    }
  });

  return mutation.mutateAsync;
}
