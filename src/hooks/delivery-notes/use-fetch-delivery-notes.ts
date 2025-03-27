
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";

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
            quantity_ordered,
            quantity_received,
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
        const items = (note.items || []).map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity_ordered: item.quantity_ordered,
          quantity_received: item.quantity_received,
          unit_price: item.unit_price,
          product: {
            name: item.product.name,
            reference: item.product.reference,
            category: item.product.category
          }
        }));

        return {
          id: note.id,
          delivery_number: note.delivery_number,
          created_at: note.created_at,
          status: note.status,
          supplier: note.supplier,
          purchase_order: note.purchase_order || null,
          items
        } as DeliveryNote;
      });
      
      return transformedData;
    }
  });
}
