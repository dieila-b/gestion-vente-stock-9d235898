
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";

export function useCreatePurchaseOrder() {
  const mutation = useMutation({
    mutationFn: async (orderData: Partial<PurchaseOrder>) => {
      console.log("Creating purchase order with data:", orderData);
      
      try {
        // Instead of using RPC, use direct insert with fallback
        const { data, error } = await supabase
          .from('purchase_orders')
          .insert({
            order_number: orderData.order_number || `PO-${new Date().getTime().toString().slice(-8)}`,
            supplier_id: orderData.supplier_id,
            status: orderData.status || 'pending',
            payment_status: orderData.payment_status || 'pending',
            total_amount: orderData.total_amount || 0,
            logistics_cost: orderData.logistics_cost || 0,
            transit_cost: orderData.transit_cost || 0,
            tax_rate: orderData.tax_rate || 0,
            subtotal: orderData.subtotal || 0,
            tax_amount: orderData.tax_amount || 0,
            total_ttc: orderData.total_ttc || 0,
            shipping_cost: orderData.shipping_cost || 0,
            discount: orderData.discount || 0,
            notes: orderData.notes || '',
            warehouse_id: orderData.warehouse_id,
            paid_amount: orderData.paid_amount || 0,
            expected_delivery_date: orderData.expected_delivery_date || new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
            
        if (error) throw error;
        return data;
      } catch (error: any) {
        console.error("Error creating purchase order:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Bon de commande créé avec succès");
      return data;
    },
    onError: (error: any) => {
      console.error("Error creating purchase order:", error);
      toast.error(`Erreur lors de la création: ${error.message || "Erreur inconnue"}`);
    }
  });

  return (orderData: Partial<PurchaseOrder>) => mutation.mutate(orderData);
}
