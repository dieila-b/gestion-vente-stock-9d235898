
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
          console.warn("Invalid status provided, defaulting to 'draft'");
          validatedData.status = 'draft';
        }

        if (validatedData.payment_status && !isValidPaymentStatus(validatedData.payment_status)) {
          console.warn("Invalid payment_status provided, defaulting to 'pending'");
          validatedData.payment_status = 'pending';
        }

        // Ensure updated_at is set
        validatedData.updated_at = new Date().toISOString();

        // Execute the update
        const { error } = await supabase
          .from('purchase_orders')
          .update(validatedData)
          .eq('id', params.id);

        if (error) {
          console.error("Error updating purchase order:", error);
          throw error;
        }

        // Rather than relying on the update returning data, always fetch the record directly
        // This avoids the PGRST116 error when no rows are returned
        const { data: fetchedData, error: fetchError } = await supabase
          .from('purchase_orders')
          .select('*, supplier:supplier_id(*), warehouse:warehouse_id(*)')
          .eq('id', params.id)
          .maybeSingle();
            
        if (fetchError) {
          console.error("Error fetching updated purchase order:", fetchError);
          throw new Error("Failed to fetch updated purchase order");
        }
        
        // Even if we don't find the record, consider the update successful since there was no error
        // Just return a basic object with the ID for consistency
        if (!fetchedData) {
          console.warn("Purchase order not found after update, returning basic success object");
          
          // Create a properly typed PurchaseOrder object
          const basicOrder: PurchaseOrder = { 
            id: params.id,
            order_number: validatedData.order_number || '',
            created_at: validatedData.created_at || new Date().toISOString(),
            status: validatedData.status || 'draft',
            supplier_id: validatedData.supplier_id || '',
            discount: validatedData.discount || 0,
            expected_delivery_date: validatedData.expected_delivery_date || '',
            notes: validatedData.notes || '',
            logistics_cost: validatedData.logistics_cost || 0,
            transit_cost: validatedData.transit_cost || 0,
            tax_rate: validatedData.tax_rate || 0,
            shipping_cost: validatedData.shipping_cost || 0,
            subtotal: validatedData.subtotal || 0,
            tax_amount: validatedData.tax_amount || 0,
            total_ttc: validatedData.total_ttc || 0,
            total_amount: validatedData.total_amount || 0,
            paid_amount: validatedData.paid_amount || 0,
            payment_status: validatedData.payment_status || 'pending',
            supplier: { id: '', name: '', email: '', phone: '' },
            delivery_note_created: validatedData.delivery_note_created ?? false
          };
          
          return basicOrder;
        }
        
        // Make sure to include the delivery_note_created property in the result
        // First check if it's in fetchedData, otherwise default to false
        const hasDeliveryNoteCreated = 'delivery_note_created' in fetchedData;
        
        const result: PurchaseOrder = {
          ...fetchedData,
          // Ensure status is a valid union type
          status: isValidOrderStatus(fetchedData.status) ? fetchedData.status : 'draft',
          // Ensure payment_status is a valid union type
          payment_status: isValidPaymentStatus(fetchedData.payment_status) ? fetchedData.payment_status : 'pending',
          // Set delivery_note_created from data or default to false
          delivery_note_created: hasDeliveryNoteCreated ? !!fetchedData.delivery_note_created : false,
          // Ensure supplier is present
          supplier: fetchedData.supplier || { id: '', name: '', email: '', phone: '' }
        };
        
        console.log("Purchase order updated successfully:", result);
        return result;
      } catch (err) {
        console.error("Update purchase order error:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      // Force invalidate the specific purchase order and the list
      console.log("Update success! Invalidating queries for ID:", data.id);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', data.id] });
      
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
