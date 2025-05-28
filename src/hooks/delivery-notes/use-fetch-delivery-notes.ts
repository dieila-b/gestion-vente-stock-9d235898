
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";

/**
 * Hook to fetch delivery notes from the database using the new RPC function
 */
export function useFetchDeliveryNotes() {
  return useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      console.log("Fetching delivery notes using RPC function...");
      try {
        // Use the new RPC function for better performance and consistency
        const { data: deliveryNotesData, error } = await supabase
          .rpc('bypass_select_delivery_notes');

        if (error) {
          console.error("Error fetching delivery notes:", error);
          throw error;
        }

        console.log("Fetched delivery notes:", deliveryNotesData);
        
        // Transform the data to match our TypeScript interfaces
        const deliveryNotes: DeliveryNote[] = (deliveryNotesData || []).map((note: any) => ({
          id: note.id,
          delivery_number: note.delivery_number,
          created_at: note.created_at,
          updated_at: note.updated_at,
          status: note.status,
          notes: note.notes,
          purchase_order_id: note.purchase_order_id,
          supplier_id: note.supplier_id,
          warehouse_id: note.warehouse_id,
          deleted: note.deleted,
          supplier: note.supplier,
          purchase_order: note.purchase_order,
          items: [] // Les items seront chargés séparément si nécessaire
        }));
        
        console.log("Transformed delivery notes:", deliveryNotes);
        return deliveryNotes;
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
        return [];
      }
    },
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
