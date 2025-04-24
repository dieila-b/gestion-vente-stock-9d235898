
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string): Promise<PurchaseOrder> => {
      try {
        console.log("Starting approval process for order:", id);
        
        // 1. Check if the order exists and its status
        const { data: orderCheck, error: checkError } = await supabase
          .from('purchase_orders')
          .select('status')
          .eq('id', id)
          .single();
          
        if (checkError) {
          console.error("Failed to check purchase order:", checkError);
          throw new Error(`Erreur de vérification: ${checkError.message}`);
        }
        
        if (!orderCheck) {
          throw new Error("Bon de commande introuvable");
        }
        
        if (orderCheck.status === 'approved') {
          console.log("Order was already approved");
          toast.info("Ce bon de commande est déjà approuvé");
          
          // Fetch the complete order to return
          const { data: fullOrder, error: fetchError } = await supabase
            .from('purchase_orders')
            .select('*, supplier:supplier_id(*)')
            .eq('id', id)
            .single();
            
          if (fetchError || !fullOrder) {
            throw new Error("Impossible de récupérer les détails du bon de commande");
          }
          
          return constructPurchaseOrder(fullOrder);
        }
        
        // 2. Update purchase order status to approved
        console.log("Updating purchase order status to approved");
        const { data: updatedOrder, error: updateError } = await supabase
          .from('purchase_orders')
          .update({ 
            status: 'approved', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', id)
          .select('*, supplier:supplier_id(*)')
          .single();
          
        if (updateError) {
          console.error("Error updating purchase order:", updateError);
          throw new Error(`Erreur lors de l'approbation: ${updateError.message}`);
        }
        
        if (!updatedOrder) {
          throw new Error("Échec de mise à jour du bon de commande");
        }

        console.log("Purchase order approved:", updatedOrder);
        
        // 3. Create a delivery note based on the purchase order
        const { data: deliveryNote, error: deliveryError } = await supabase
          .from("delivery_notes")
          .insert({
            supplier_id: updatedOrder.supplier_id,
            purchase_order_id: id,
            delivery_number: `BL-${updatedOrder.order_number?.replace(/\D/g, '') || new Date().getTime().toString().slice(-6)}`,
            status: "pending",
            notes: `Généré automatiquement depuis le bon de commande #${updatedOrder.order_number || id.substring(0, 8)}`,
            warehouse_id: updatedOrder.warehouse_id
          })
          .select()
          .single();
          
        if (deliveryError) {
          console.error("Error creating delivery note:", deliveryError);
          // Continue despite error, the purchase order is still approved
        } else {
          console.log("Delivery note created:", deliveryNote);
          
          // Create delivery note items from purchase order items
          const { data: orderItems, error: itemsError } = await supabase
            .from('purchase_order_items')
            .select('*')
            .eq('purchase_order_id', id);
            
          if (itemsError) {
            console.error("Error fetching purchase order items:", itemsError);
          } else if (orderItems && orderItems.length > 0 && deliveryNote) {
            const deliveryItems = orderItems.map(item => ({
              delivery_note_id: deliveryNote.id,
              product_id: item.product_id,
              quantity_ordered: item.quantity,
              unit_price: item.unit_price,
              quantity_received: 0
            }));
            
            const { error: insertError } = await supabase
              .from('delivery_note_items')
              .insert(deliveryItems);
              
            if (insertError) {
              console.error("Error creating delivery note items:", insertError);
            } else {
              console.log(`Created ${deliveryItems.length} delivery note items`);
            }
          }
        }
        
        // Mark the order as having a delivery note
        // This property is now added to the PurchaseOrder interface
        await supabase
          .from('purchase_orders')
          .update({ delivery_note_created: true })
          .eq('id', id);
        
        // 4. Refresh affected queries
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        
        toast.success("Bon de commande approuvé et bon de livraison créé");
        
        // Return the updated purchase order
        return constructPurchaseOrder(updatedOrder);
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        throw error;
      }
    }
  });

  // Helper function to construct a properly typed PurchaseOrder object
  function constructPurchaseOrder(data: any): PurchaseOrder {
    // Ensure supplier is properly structured
    const supplier = data.supplier && typeof data.supplier === 'object' 
      ? data.supplier 
      : {
          id: data.supplier_id || '',
          name: "Fournisseur inconnu",
          phone: "",
          email: ""
        };
    
    return {
      id: data.id || '',
      order_number: data.order_number || '',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || data.created_at || new Date().toISOString(),
      status: (data.status as "approved" | "draft" | "pending" | "delivered") || "approved",
      supplier_id: data.supplier_id || '',
      discount: data.discount || 0,
      expected_delivery_date: data.expected_delivery_date || '',
      notes: data.notes || '',
      logistics_cost: data.logistics_cost || 0,
      transit_cost: data.transit_cost || 0,
      tax_rate: data.tax_rate || 0,
      shipping_cost: data.shipping_cost || 0,
      subtotal: data.subtotal || 0,
      tax_amount: data.tax_amount || 0,
      total_ttc: data.total_ttc || 0,
      total_amount: data.total_amount || 0,
      paid_amount: data.paid_amount || 0,
      payment_status: (data.payment_status as "pending" | "partial" | "paid") || "pending",
      warehouse_id: data.warehouse_id || undefined,
      supplier: supplier,
      items: data.items || [],
      delivery_note_created: data.delivery_note_created || false // Include the property here
    };
  }

  return mutation.mutateAsync;
}
