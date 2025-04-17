
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Approving purchase order:", id);
        
        // Update the purchase order status
        const { data, error } = await supabase
          .from('purchase_orders')
          .update({ status: 'approved' })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error("Error updating purchase order status:", error);
          throw error;
        }

        // Now create a delivery note based on the purchase order
        if (data) {
          const purchaseOrder = data as PurchaseOrder;
          
          // Check if a delivery note already exists for this purchase order
          const { data: existingDeliveryNote, error: checkError } = await supabase
            .from('delivery_notes')
            .select('id')
            .eq('purchase_order_id', purchaseOrder.id)
            .maybeSingle();
            
          if (checkError) {
            console.error("Error checking existing delivery notes:", checkError);
            throw checkError;
          }
          
          // Only create a new delivery note if one doesn't exist
          if (!existingDeliveryNote) {
            console.log("Creating delivery note for purchase order:", purchaseOrder.id);
            
            // First create the delivery note
            const { data: deliveryNote, error: deliveryNoteError } = await supabase
              .from('delivery_notes')
              .insert({
                purchase_order_id: purchaseOrder.id,
                supplier_id: purchaseOrder.supplier_id,
                delivery_number: `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                status: 'pending',
                deleted: false, // Explicitly set deleted to false
                notes: `Bon de livraison créé automatiquement depuis la commande ${purchaseOrder.order_number || ''}`
              })
              .select()
              .single();

            if (deliveryNoteError) {
              console.error("Error creating delivery note:", deliveryNoteError);
              throw deliveryNoteError;
            }

            console.log("Created delivery note:", deliveryNote);

            // Then create delivery note items based on purchase order items
            if (deliveryNote && purchaseOrder.items && purchaseOrder.items.length > 0) {
              const deliveryItemsData = purchaseOrder.items.map(item => ({
                delivery_note_id: deliveryNote.id,
                product_id: item.product_id,
                quantity_ordered: item.quantity,
                quantity_received: 0, // Initial value, to be updated on reception
                unit_price: item.unit_price
              }));

              const { error: itemsError } = await supabase
                .from('delivery_note_items')
                .insert(deliveryItemsData);

              if (itemsError) {
                console.error("Error creating delivery note items:", itemsError);
                throw itemsError;
              }
              
              console.log("Created delivery note items");
            }
          } else {
            console.log("Delivery note already exists for this purchase order");
          }
        }

        return data;
      } catch (error: any) {
        console.error("Error approving purchase order:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success("Commande approuvée avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    }
  });
}
