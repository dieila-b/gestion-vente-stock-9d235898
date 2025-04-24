
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
          return constructPurchaseOrder({ ...orderCheck, delivery_note_created: true });
        }
        
        // 2. Update purchase order status
        const updatedOrder = await updatePurchaseOrderToApproved(id);
        
        // 3. Create delivery note
        const deliveryNote = await createDeliveryNote(updatedOrder);
        
        if (deliveryNote) {
          // 4. Create delivery note items
          await createDeliveryNoteItems(deliveryNote.id, id);
        }
        
        // 5. Mark delivery note as created
        await markDeliveryNoteCreated(id);
        
        // 6. Refresh affected queries
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        
        toast.success("Bon de commande approuvé et bon de livraison créé");
        
        return constructPurchaseOrder({ ...updatedOrder, delivery_note_created: true });
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        throw error;
      }
    }
  });

  return mutation.mutateAsync;
}
