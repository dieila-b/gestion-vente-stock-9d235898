
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";
import { validatePurchaseOrder } from "./utils/validate-purchase-order";
import { updatePurchaseOrderToApproved } from "./utils/update-purchase-order-status";
import { createDeliveryNote } from "./utils/create-delivery-note";
import { createDeliveryNoteItems } from "./utils/create-delivery-note-items";
import { supabase } from "@/integrations/supabase/client";
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
          
          // We return the validated order which is already a complete PurchaseOrder
          return orderCheck;
        }
        
        // 2. Update the purchase order status
        const updatedOrder = await updatePurchaseOrderToApproved(id);
        console.log("Order updated to approved:", updatedOrder.id);
        
        try {
          // 3. Create the delivery note
          const deliveryNote = await createDeliveryNote(updatedOrder);
          console.log("Delivery note created:", deliveryNote);
          
          if (deliveryNote && deliveryNote.id) {
            // 4. Create the delivery note items
            const deliveryItems = await createDeliveryNoteItems(deliveryNote.id, id);
            console.log("Delivery note items created:", deliveryItems?.length || 0);
            
            // 5. Update the purchase order to mark delivery note as created
            const { data: updatedWithDelivery, error } = await supabase
              .from("purchase_orders")
              .update({ delivery_note_created: true })
              .eq("id", id)
              .select()
              .single();
              
            console.log("Purchase order updated with delivery_note_created flag");
            
            // 6. Invalidate affected queries
            await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
            
            toast.success("Bon de commande approuvé et bon de livraison créé");
            
            // Return a properly typed PurchaseOrder with delivery_note_created set to true
            if (!error && updatedWithDelivery) {
              return constructPurchaseOrder({
                ...updatedWithDelivery,
                delivery_note_created: true
              });
            }
          } else {
            console.error("Failed to create delivery note");
            toast.error("Erreur lors de la création du bon de livraison");
          }
        } catch (deliveryError: any) {
          console.error("Error creating delivery note:", deliveryError);
          toast.error(`Erreur lors de la création du bon de livraison: ${deliveryError.message}`);
        }
        
        // If we reach this point, ensure we return a valid PurchaseOrder
        return constructPurchaseOrder({
          ...updatedOrder,
          delivery_note_created: true
        });
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        toast.error(`Erreur lors de l'approbation: ${error.message || "Erreur inconnue"}`);
        throw error;
      }
    }
  });

  return mutation.mutateAsync;
}
