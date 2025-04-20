
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
        
        // Try using the db utility first (bypasses RLS)
        try {
          const insertedOrder = await db.insert('purchase_orders', finalOrderData);
          
          if (!insertedOrder) {
            throw new Error("Failed to create purchase order via db utility");
          }
          
          console.log("Purchase order created successfully via db utility:", insertedOrder);
          return insertedOrder;
        } catch (dbError) {
          console.error("DB insertion failed, trying direct Supabase insertion:", dbError);
          
          // Try direct Supabase insertion as fallback
          const { data: supabaseResult, error: supabaseError } = await supabase
            .from('purchase_orders')
            .insert(finalOrderData)
            .select();
          
          if (supabaseError) {
            console.error("Supabase insertion failed:", supabaseError);
            throw supabaseError;
          }
          
          console.log("Purchase order created successfully via Supabase:", supabaseResult[0]);
          return supabaseResult[0];
        }
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
