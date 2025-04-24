
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";
import { validatePurchaseOrder } from "./utils/validate-purchase-order";
import { updatePurchaseOrderToApproved, markDeliveryNoteCreated } from "./utils/update-purchase-order-status";
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
        
        if (orderCheck.status === 'approved') {
          console.log("Order was already approved");
          toast.info("Ce bon de commande est déjà approuvé");
          
          // Since validatePurchaseOrder doesn't return delivery_note_created 
          // we need to work with the data we have
          return constructPurchaseOrder({ 
            ...orderCheck, 
            delivery_note_created: false // Default to false if not known
          });
        }
        
        // 2. Update purchase order status
        const updatedOrder = await updatePurchaseOrderToApproved(id);
        console.log("Order updated to approved:", updatedOrder);
        
        // 3. Create delivery note
        const deliveryNote = await createDeliveryNote(updatedOrder);
        console.log("Delivery note created:", deliveryNote?.id);
        
        if (deliveryNote) {
          // 4. Create delivery note items
          await createDeliveryNoteItems(deliveryNote.id, id);
          console.log("Delivery note items created");
        }
        
        // 5. Mark delivery note as created
        await markDeliveryNoteCreated(id);
        console.log("Order marked as having delivery note created");
        
        // 6. Refresh affected queries
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        
        toast.success("Bon de commande approuvé et bon de livraison créé");
        
        // Make sure we're returning with delivery_note_created set to true
        const result = constructPurchaseOrder({ 
          ...updatedOrder, 
          delivery_note_created: true // We know we just created it
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
