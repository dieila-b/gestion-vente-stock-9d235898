
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

      // Generate order number if not provided
      const finalOrderData = {
        ...orderData,
        order_number: orderData.order_number || `BC-${new Date().toISOString().slice(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status: orderData.status || 'pending',
        payment_status: orderData.payment_status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      try {
        console.log("Attempting direct insert via Supabase...");
        
        // Create a clean version of the data without complex objects
        const cleanOrderData = { ...finalOrderData };
        if ('supplier' in cleanOrderData) {
          delete cleanOrderData.supplier;
        }
        
        // Use the Supabase API directly with specific options
        const { data: insertResult, error } = await supabase
          .from('purchase_orders')
          .insert(cleanOrderData)
          .select()
          .single();

        if (!error && insertResult) {
          console.log("Purchase order created successfully via direct insert:", insertResult);
          return insertResult;
        }

        // If error, fallback to RPC
        if (error) {
          console.error("Supabase insertion failed with error:", error);
          console.log("Trying fallback with RPC function...");

          // Create a clean JSON-serializable object for RPC
          const rpcOrderData = { ...cleanOrderData };
          
          // Ensure all properties are JSON-serializable
          const jsonSafeData = JSON.parse(JSON.stringify(rpcOrderData));

          // Call the RPC function
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'bypass_insert_purchase_order',
            { order_data: jsonSafeData }
          );

          if (rpcError) {
            console.error("Fallback insertion also failed:", rpcError);
            throw rpcError;
          }
          
          console.log("RPC fallback succeeded:", rpcResult);
          return rpcResult;
        }
        
        throw new Error("Failed to create purchase order");
      } catch (error) {
        console.error("Error in purchase order creation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Bon de commande créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      return data;
    },
    onError: (error: any) => {
      console.error("Error creating purchase order:", error);
      toast.error(`Erreur lors de la création: ${error.message || "Erreur inconnue"}`);
    }
  });

  return mutation;
}
