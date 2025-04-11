
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";
import { isSelectQueryError } from "@/utils/supabase-helpers";
import { safelyMapData, safelyUnwrapObject } from "@/hooks/use-error-handling";

export function useFetchDeliveryNotes() {
  return useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      console.log("Fetching delivery notes...");
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          id,
          delivery_number,
          created_at,
          status,
          supplier:suppliers (
            name,
            phone,
            email
          ),
          purchase_order:purchase_orders!delivery_notes_purchase_order_id_fkey (
            order_number,
            total_amount
          ),
          items:delivery_note_items (
            id,
            product_id,
            expected_quantity,
            received_quantity,
            unit_price,
            product:catalog!delivery_note_items_product_id_fkey (
              name,
              reference,
              category
            )
          )
        `)
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching delivery notes:", error);
        throw error;
      }
      
      if (!data) return [];

      const transformedData = data.map(note => {
        // Create default values for potentially errored fields
        const defaultSupplier = { name: 'Unknown Supplier', phone: '', email: '' };
        const defaultPurchaseOrder = { order_number: 'Unknown', total_amount: 0 };
        
        // Safely handle items which may be a SelectQueryError
        let items = [];
        if (!isSelectQueryError(note.items)) {
          items = Array.isArray(note.items) ? note.items.map(item => {
            const defaultProduct = { name: 'Unknown Product', reference: '', category: '' };
            const product = isSelectQueryError(item.product) ? defaultProduct : (item.product || defaultProduct);
            
            return {
              id: item.id,
              product_id: item.product_id,
              expected_quantity: item.expected_quantity,
              received_quantity: item.received_quantity,
              unit_price: item.unit_price,
              product
            };
          }) : [];
        }
        
        // Handle supplier which may be a SelectQueryError
        const supplier = safelyUnwrapObject(note.supplier, defaultSupplier);
        
        // Handle purchase_order which may be a SelectQueryError
        const purchaseOrder = safelyUnwrapObject(note.purchase_order, defaultPurchaseOrder);

        // Return the transformed delivery note
        return {
          id: note.id,
          delivery_number: note.delivery_number,
          created_at: note.created_at,
          status: note.status,
          supplier,
          purchase_order: purchaseOrder,
          items
        } as DeliveryNote;
      });
      
      return transformedData;
    }
  });
}
