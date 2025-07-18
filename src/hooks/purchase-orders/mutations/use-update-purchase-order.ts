
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PurchaseOrder } from "@/types/purchase-order";
import { toast } from "sonner";

// Type guard functions
function isValidOrderStatus(status: string): status is PurchaseOrder['status'] {
  return ['pending', 'draft', 'delivered', 'approved'].includes(status);
}

function isValidPaymentStatus(status: string): status is PurchaseOrder['payment_status'] {
  return ['pending', 'partial', 'paid'].includes(status);
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<PurchaseOrder> }) => {
      try {
        console.log("Updating purchase order:", params.id);
        console.log("Update data:", JSON.stringify(params.data, null, 2));
        
        // Validate and clean the data
        const validatedData = { ...params.data };

        // Remove any undefined or null values that shouldn't be updated
        Object.keys(validatedData).forEach(key => {
          if (validatedData[key as keyof PurchaseOrder] === undefined) {
            delete validatedData[key as keyof PurchaseOrder];
          }
        });

        // Validate status and payment_status if present
        if (validatedData.status && !isValidOrderStatus(validatedData.status)) {
          console.warn("Invalid status provided, defaulting to 'pending'");
          validatedData.status = 'pending';
        }

        if (validatedData.payment_status && !isValidPaymentStatus(validatedData.payment_status)) {
          console.warn("Invalid payment_status provided, defaulting to 'pending'");
          validatedData.payment_status = 'pending';
        }

        // Ensure updated_at is set
        validatedData.updated_at = new Date().toISOString();
        
        // Convert numeric fields to numbers to ensure they're properly saved
        const numericFields = ['subtotal', 'tax_amount', 'total_ttc', 'total_amount', 
                              'discount', 'shipping_cost', 'transit_cost', 'logistics_cost', 
                              'tax_rate', 'paid_amount'] as const;
        
        numericFields.forEach(field => {
          if (field in validatedData && validatedData[field] !== undefined) {
            validatedData[field] = Number(validatedData[field]) || 0;
          }
        });
        
        // Remove supplier and warehouse data from update payload as they are relations
        delete validatedData.supplier;
        delete validatedData.warehouse;
        delete validatedData.items;
        
        console.log("Final validated data to update:", validatedData);

        // Execute the update
        const { data: updateResult, error } = await supabase
          .from('purchase_orders')
          .update(validatedData)
          .eq('id', params.id)
          .select('*')
          .single();

        if (error) {
          console.error("Error updating purchase order:", error);
          throw error;
        }

        console.log("Purchase order updated successfully:", updateResult);
        // Cast the result properly since we know it contains the required fields
        return updateResult as unknown as PurchaseOrder;
        
      } catch (err) {
        console.error("Update purchase order error:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // Force invalidate the specific purchase order and the list
      console.log("Update success! Invalidating queries for ID:", data.id);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-with-items', data.id] });
      
      // Add a success toast
      toast.success("Bon de commande mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Purchase order update error:", error);
      toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });

  // Return a function with explicit type definition
  return async (id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
    try {
      console.log("Calling mutateAsync for update", id);
      const result = await mutation.mutateAsync({ id, data });
      console.log("Update complete with result:", result);
      return result;
    } catch (error) {
      console.error("useUpdatePurchaseOrder hook error:", error);
      return null;
    }
  };
}
