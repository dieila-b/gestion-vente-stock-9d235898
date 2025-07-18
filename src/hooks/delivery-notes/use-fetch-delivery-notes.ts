
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
      console.log("Fetching delivery notes with items...");
      try {
        // First, fetch delivery notes with basic relations
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
            supplier:suppliers (
              id,
              name,
              email,
              phone
            ),
            purchase_order:purchase_orders (
              id,
              order_number,
              total_amount
            )
          `)
          .eq('deleted', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching delivery notes:", error);
          throw error;
        }

        console.log("Raw delivery notes data:", deliveryNotesData);
        
        if (!deliveryNotesData || deliveryNotesData.length === 0) {
          console.log("No delivery notes found");
          return [];
        }

        // Fetch items for all delivery notes
        const deliveryNoteIds = deliveryNotesData.map(note => note.id);
        console.log("Fetching items for delivery note IDs:", deliveryNoteIds);
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('delivery_note_items')
          .select(`
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
          `)
          .in('delivery_note_id', deliveryNoteIds);
          
        if (itemsError) {
          console.error("Error fetching delivery note items:", itemsError);
        }

        console.log("Fetched items data:", itemsData);
        
        // Group items by delivery note ID
        const itemsByDeliveryNote = (itemsData || []).reduce((acc, item) => {
          if (!acc[item.delivery_note_id]) {
            acc[item.delivery_note_id] = [];
          }
          acc[item.delivery_note_id].push({
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
            } : {
              id: item.product_id,
              name: 'Produit non disponible',
              reference: ''
            }
          });
          return acc;
        }, {} as Record<string, any[]>);
        
        // Transform the data to match our TypeScript interfaces
        const transformedNotes: DeliveryNote[] = deliveryNotesData.map(note => ({
          id: note.id,
          delivery_number: note.delivery_number || `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          created_at: note.created_at || '',
          updated_at: note.updated_at || '',
          status: note.status || 'pending',
          notes: note.notes || '',
          purchase_order_id: note.purchase_order_id,
          supplier_id: note.supplier_id,
          warehouse_id: note.warehouse_id,
          deleted: note.deleted || false,
          supplier: note.supplier ? {
            id: note.supplier.id,
            name: note.supplier.name,
            phone: note.supplier.phone || '',
            email: note.supplier.email || ''
          } : {
            id: '',
            name: 'Fournisseur inconnu',
            phone: '',
            email: ''
          },
          purchase_order: note.purchase_order ? {
            id: note.purchase_order.id,
            order_number: note.purchase_order.order_number || '',
            total_amount: note.purchase_order.total_amount || 0
          } : {
            id: '',
            order_number: 'N/A',
            total_amount: 0
          },
          items: itemsByDeliveryNote[note.id] || []
        }));
        
        console.log("Final transformed delivery notes:", transformedNotes);
        console.log("Total delivery notes returned:", transformedNotes.length);
        
        return transformedNotes;
      } catch (error) {
        console.error("Error in delivery notes fetch:", error);
        throw error;
      }
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
