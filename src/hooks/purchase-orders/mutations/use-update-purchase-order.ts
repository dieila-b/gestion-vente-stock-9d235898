
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
        console.log("Updating purchase order:", params.id, "with data:", params.data);
        
        // Validate status and payment_status if present
        const validatedData = { ...params.data };

        if (validatedData.status && !isValidOrderStatus(validatedData.status)) {
          validatedData.status = 'draft';
        }

        if (validatedData.payment_status && !isValidPaymentStatus(validatedData.payment_status)) {
          validatedData.payment_status = 'pending';
        }

        // Ensure updated_at is set
        validatedData.updated_at = new Date().toISOString();

        // Execute the update
        const { data, error } = await supabase
          .from('purchase_orders')
          .update(validatedData)
          .eq('id', params.id)
          .select('*');

        if (error) {
          console.error("Error updating purchase order:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error("No purchase order was updated");
        }

        console.log("Purchase order updated successfully:", data[0]);
        
        return data[0] as PurchaseOrder;
      } catch (err) {
        console.error("Update purchase order error:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // Force invalidate the specific purchase order and the list
      console.log("Invalidating queries after update success for ID:", data.id);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', data.id] });
      // Ne pas afficher de toast ici pour éviter les doublons avec celui de PurchaseOrderEditForm
    },
    onError: (error) => {
      console.error("Purchase order update error:", error);
      toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });

  // Return a function with explicit type definition
  return async (id: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
    try {
      const result = await mutation.mutateAsync({ id, data });
      console.log("Update complete with result:", result);
      return result;
    } catch (error) {
      console.error("useUpdatePurchaseOrder hook error:", error);
      return null;
    }
  };
}
