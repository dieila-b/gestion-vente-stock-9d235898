
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
        
        // 1. Check if the order is already approved
        const { data: existingOrder, error: checkError } = await supabase
          .from('purchase_orders')
          .select('status')
          .eq('id', id)
          .single();
          
        if (checkError) {
          console.error("Error checking order status:", checkError);
          throw new Error(`Erreur de vérification: ${checkError.message}`);
        }
        
        if (existingOrder?.status === 'approved') {
          console.log("Order was already approved, no action needed");
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
        
        // 2. Update purchase order status
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
          throw new Error("Bon de commande introuvable");
        }

        console.log("Purchase order approved:", updatedOrder);
        
        // 3. Refresh affected queries
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        
        // 4. Construct a properly typed PurchaseOrder
        const purchaseOrder = constructPurchaseOrder(updatedOrder);
        
        toast.success("Bon de commande approuvé et bon de livraison créé");
        return purchaseOrder;
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        throw error;
      }
    }
  });

  // Helper function to construct a properly typed PurchaseOrder object
  function constructPurchaseOrder(data: any): PurchaseOrder {
    // Ensure supplier is properly structured
    const supplier = data.supplier && typeof data.supplier === 'object' && !('error' in data.supplier) 
      ? data.supplier 
      : {
          id: data.supplier_id,
          name: "Fournisseur inconnu",
          phone: "",
          email: ""
        };
    
    // Cast status and payment_status to the correct types
    const status = data.status as "approved" | "draft" | "pending" | "delivered";
    const paymentStatus = data.payment_status as "pending" | "partial" | "paid";
    
    return {
      id: data.id,
      order_number: data.order_number || '',
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || data.created_at || new Date().toISOString(),
      status: status || "approved",
      supplier_id: data.supplier_id,
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
      payment_status: paymentStatus || "pending",
      warehouse_id: data.warehouse_id || undefined,
      supplier: supplier,
      items: data.items || []
    };
  }

  return mutation.mutateAsync;
}
