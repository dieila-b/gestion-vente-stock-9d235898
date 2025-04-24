
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
        
        // 1. Validate the purchase order
        const orderCheck = await validatePurchaseOrder(id);
        
        // Check if the order is already approved
        if (orderCheck.status === 'approved') {
          console.log("Order was already approved");
          toast.info("Ce bon de commande est déjà approuvé");
          
          // Construct a minimal object for already approved orders
          return constructPurchaseOrder({ 
            id: orderCheck.id,
            status: orderCheck.status,
            delivery_note_created: false
          });
        }
        
        // 2. Update the purchase order status
        const updatedOrder = await updatePurchaseOrderToApproved(id);
        console.log("Order updated to approved:", updatedOrder.id);
        
        // Variable to track if a delivery note was successfully created
        let deliveryNoteCreated = false;
        let deliveryNoteId = null;
        
        try {
          // 3. Create the delivery note
          const deliveryNote = await createDeliveryNote(updatedOrder);
          console.log("Delivery note creation result:", deliveryNote);
          
          if (deliveryNote && deliveryNote.id) {
            deliveryNoteId = deliveryNote.id;
            
            // 4. Create the delivery note items
            const deliveryItems = await createDeliveryNoteItems(deliveryNote.id, id);
            console.log("Delivery note items created:", deliveryItems?.length || 0);
            
            // Only mark as created if the items were successfully created
            deliveryNoteCreated = true;
          } else {
            console.warn("No delivery note ID returned or creation failed");
          }
        } catch (deliveryError: any) {
          // If there's an error creating the delivery note, continue
          // but mark delivery_note_created as false
          console.error("Error creating delivery note:", deliveryError?.message || deliveryError);
          toast.error(`Erreur lors de la création du bon de livraison: ${deliveryError?.message || "Erreur inconnue"}`);
        }
        
        // 5. Invalidate affected queries
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        if (deliveryNoteCreated) {
          await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        }
        
        // 6. Show appropriate notification
        if (deliveryNoteCreated) {
          toast.success("Bon de commande approuvé et bon de livraison créé");
        } else {
          toast.success("Bon de commande approuvé");
          toast.warning("Création du bon de livraison échouée");
        }
        
        // 7. Build the return object with the correct value for delivery_note_created
        const finalResult = constructPurchaseOrder({
          ...updatedOrder,
          delivery_note_created: Boolean(deliveryNoteCreated) // Explicit conversion to boolean
        });
        
        console.log("Final approval result:", {
          id: finalResult.id,
          status: finalResult.status,
          delivery_note_created: finalResult.delivery_note_created
        });
        
        return finalResult;
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        toast.error(`Erreur lors de l'approbation: ${error?.message || "Erreur inconnue"}`);
        throw error;
      }
    }
  });

  return mutation.mutateAsync;
}
