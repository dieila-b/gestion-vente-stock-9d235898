
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";
import { safeGet, safeSupplier } from "@/utils/select-query-helper";

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
        const items = (safeGet(note, 'items', []) || []).map(item => ({
          id: safeGet(item, 'id', ''),
          product_id: safeGet(item, 'product_id', ''),
          quantity_ordered: safeGet(item, 'quantity_ordered', 0),
          quantity_received: safeGet(item, 'quantity_received', 0),
          unit_price: safeGet(item, 'unit_price', 0),
          product: {
            name: safeGet(item.product, 'name', 'Produit non disponible'),
            reference: safeGet(item.product, 'reference', ''),
            category: safeGet(item.product, 'category', '')
          }
        }));

        return {
          id: safeGet(note, 'id', ''),
          delivery_number: safeGet(note, 'delivery_number', ''),
          created_at: safeGet(note, 'created_at', ''),
          status: safeGet(note, 'status', ''),
          supplier: safeSupplier(note.supplier),
          purchase_order: safeGet(note, 'purchase_order', null),
          items
        } as DeliveryNote;
      });
      
      return transformedData;
    }
  });
}
