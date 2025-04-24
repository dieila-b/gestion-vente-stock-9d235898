
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
        
        // 1. Update purchase order status
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
        
        // The delivery note will be created automatically by the database trigger
        
        // 2. Refresh affected queries
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        
        // Ensure we have a valid supplier object
        const supplier = updatedOrder.supplier || {
          id: updatedOrder.supplier_id,
          name: "Fournisseur inconnu",
          phone: "",
          email: ""
        };

        // Build a properly typed PurchaseOrder object
        const typedStatus = updatedOrder.status as "approved" | "draft" | "pending" | "delivered";
        const typedPaymentStatus = updatedOrder.payment_status as "pending" | "partial" | "paid";
        
        // Create a well-formed PurchaseOrder object
        const purchaseOrder: PurchaseOrder = {
          id: updatedOrder.id,
          order_number: updatedOrder.order_number,
          created_at: updatedOrder.created_at,
          updated_at: updatedOrder.updated_at || updatedOrder.created_at,
          status: typedStatus,
          supplier_id: updatedOrder.supplier_id,
          discount: updatedOrder.discount || 0,
          expected_delivery_date: updatedOrder.expected_delivery_date || "",
          notes: updatedOrder.notes || "",
          logistics_cost: updatedOrder.logistics_cost || 0,
          transit_cost: updatedOrder.transit_cost || 0,
          tax_rate: updatedOrder.tax_rate || 0,
          shipping_cost: updatedOrder.shipping_cost || 0,
          subtotal: updatedOrder.subtotal || 0,
          tax_amount: updatedOrder.tax_amount || 0,
          total_ttc: updatedOrder.total_ttc || 0,
          total_amount: updatedOrder.total_amount || 0,
          paid_amount: updatedOrder.paid_amount || 0,
          payment_status: typedPaymentStatus,
          warehouse_id: updatedOrder.warehouse_id || undefined,
          supplier: supplier,
          items: [] // We initialize with an empty array, the items will be loaded separately if needed
        };
        
        toast.success("Bon de commande approuvé et bon de livraison créé");
        return purchaseOrder;
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        throw error;
      }
    }
  });

  return mutation.mutateAsync;
}
