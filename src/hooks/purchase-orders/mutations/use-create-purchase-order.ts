
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchase-order";
import { db } from "@/utils/db-core";

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (orderData: Partial<PurchaseOrder>) => {
      console.log("Creating purchase order with data:", orderData);
      
      try {
        // Generate order number if not provided
        const finalOrderData = {
          ...orderData,
          order_number: orderData.order_number || `PO-${new Date().getTime().toString().slice(-8)}`,
          status: orderData.status || 'pending',
          payment_status: orderData.payment_status || 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Direct Supabase insertion without going through RLS
        const { data: insertResult, error } = await supabase
          .from('purchase_orders')
          .insert(finalOrderData)
          .select()
          .single();
        
        if (error) {
          console.error("Supabase insertion failed:", error);
          throw error;
        }
        
        console.log("Purchase order created successfully via Supabase:", insertResult);
        return insertResult;
      } catch (error: any) {
        console.error("Error in createPurchaseOrder:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Bon de commande créé avec succès");
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      return data;
    },
    onError: (error: any) => {
      console.error("Error creating purchase order:", error);
      toast.error(`Erreur lors de la création: ${error.message || "Erreur inconnue"}`);
    }
  });

  return mutation;
}
