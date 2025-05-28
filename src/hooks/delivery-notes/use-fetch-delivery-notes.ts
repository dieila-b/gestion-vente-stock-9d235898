
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";

/**
 * Hook to fetch delivery notes from the database with their items
 */
export function useFetchDeliveryNotes() {
  return useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      console.log("🔍 Starting delivery notes fetch...");
      
      try {
        // Test basic connectivity first
        const { data: testData, error: testError } = await supabase
          .from('delivery_notes')
          .select('id')
          .limit(1);
          
        console.log("🔗 Basic connectivity test:", { testData, testError });
        
        // Fetch delivery notes with their relationships
        const { data: deliveryNotesData, error } = await supabase
          .from('delivery_notes')
          .select(`
            id,
            delivery_number,
            created_at,
            updated_at,
            status,
            notes,
            purchase_order_id,
            supplier_id,
            warehouse_id,
            deleted,
            supplier:suppliers(
              id,
              name,
              email,
              phone
            ),
            purchase_order:purchase_orders(
              id,
              order_number,
              total_amount
            ),
            items:delivery_note_items(
              id,
              delivery_note_id,
              product_id,
              quantity_ordered,
              quantity_received,
              unit_price,
              product:catalog(
                id,
                name,
                reference
              )
            )
          `)
          .eq('deleted', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("❌ Error fetching delivery notes:", error);
          throw error;
        }

        console.log("📦 Raw delivery notes data:", deliveryNotesData);
        console.log("📊 Number of delivery notes found:", deliveryNotesData?.length || 0);
        
        if (!deliveryNotesData || deliveryNotesData.length === 0) {
          console.log("⚠️  No delivery notes found in database");
          return [];
        }
        
        // Transform the data to match our TypeScript interfaces
        const transformedNotes: DeliveryNote[] = deliveryNotesData.map(note => {
          console.log(`🔄 Processing delivery note ${note.delivery_number}:`, {
            id: note.id,
            itemsCount: note.items?.length || 0,
            items: note.items
          });
          
          return {
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
            supplier: note.supplier ? {
              id: note.supplier.id,
              name: note.supplier.name,
              phone: note.supplier.phone || '',
              email: note.supplier.email || ''
            } : undefined,
            purchase_order: note.purchase_order ? {
              id: note.purchase_order.id,
              order_number: note.purchase_order.order_number,
              total_amount: note.purchase_order.total_amount
            } : undefined,
            items: (note.items || []).map(item => ({
              id: item.id,
              delivery_note_id: item.delivery_note_id,
              product_id: item.product_id,
              quantity_ordered: item.quantity_ordered,
              quantity_received: item.quantity_received,
              unit_price: item.unit_price,
              product: item.product ? {
                id: item.product.id,
                name: item.product.name,
                reference: item.product.reference
              } : undefined
            }))
          };
        });
        
        console.log("✅ Transformed delivery notes:", transformedNotes);
        console.log("📈 Final count:", transformedNotes.length);
        
        return transformedNotes;
      } catch (error) {
        console.error("💥 Critical error in delivery notes fetch:", error);
        // Don't return empty array on error, let the error bubble up
        throw error;
      }
    },
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
