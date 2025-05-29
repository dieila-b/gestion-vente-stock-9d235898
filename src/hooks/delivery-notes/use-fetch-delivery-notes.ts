
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
      console.log("Fetching delivery notes...");
      
      try {
        // First, get basic delivery notes data
        const { data: deliveryNotesData, error } = await supabase
          .from('delivery_notes')
          .select(`
            *,
            supplier:suppliers(id, name, email, phone),
            purchase_order:purchase_orders(id, order_number, total_amount)
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
        
        // Then fetch all items for these delivery notes
        const deliveryNoteIds = deliveryNotesData.map(note => note.id);
        console.log("Fetching items for delivery note IDs:", deliveryNoteIds);
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('delivery_note_items')
          .select(`
            *,
            product:catalog(id, name, reference)
          `)
          .in('delivery_note_id', deliveryNoteIds);
          
        if (itemsError) {
          console.error("Error fetching delivery note items:", itemsError);
        }
        
        console.log("Fetched items data:", itemsData);
        
        // Group items by delivery note ID
        const itemsByDeliveryNote = {};
        if (itemsData) {
          itemsData.forEach(item => {
            if (!itemsByDeliveryNote[item.delivery_note_id]) {
              itemsByDeliveryNote[item.delivery_note_id] = [];
            }
            itemsByDeliveryNote[item.delivery_note_id].push(item);
          });
        }
        
        console.log("Items grouped by delivery note:", itemsByDeliveryNote);
        
        // Transform to match our interface
        const transformedNotes = deliveryNotesData.map(note => {
          const items = itemsByDeliveryNote[note.id] || [];
          
          return {
            id: note.id,
            delivery_number: note.delivery_number || `BL-${note.id.slice(0, 8)}`,
            created_at: note.created_at,
            updated_at: note.updated_at,
            status: note.status || 'pending',
            notes: note.notes || '',
            purchase_order_id: note.purchase_order_id,
            supplier_id: note.supplier_id,
            warehouse_id: note.warehouse_id,
            deleted: note.deleted || false,
            supplier: note.supplier ? {
              id: note.supplier.id,
              name: note.supplier.name || 'Fournisseur inconnu',
              email: note.supplier.email,
              phone: note.supplier.phone
            } : {
              id: '',
              name: 'Fournisseur inconnu',
              email: '',
              phone: ''
            },
            purchase_order: note.purchase_order ? {
              id: note.purchase_order.id,
              order_number: note.purchase_order.order_number || 'N/A',
              total_amount: note.purchase_order.total_amount || 0
            } : {
              id: '',
              order_number: 'N/A',
              total_amount: 0
            },
            items: items.map(item => ({
              id: item.id,
              delivery_note_id: item.delivery_note_id,
              product_id: item.product_id,
              quantity_ordered: item.quantity_ordered || 0,
              quantity_received: item.quantity_received || 0,
              unit_price: item.unit_price || 0,
              product: item.product ? {
                id: item.product.id,
                name: item.product.name || 'Produit inconnu',
                reference: item.product.reference || ''
              } : {
                id: item.product_id,
                name: 'Produit inconnu',
                reference: ''
              }
            }))
          };
        });
        
        console.log("Final transformed notes:", transformedNotes);
        return transformedNotes;
        
      } catch (error) {
        console.error("Error in delivery notes query:", error);
        throw error; // Re-throw to show error in UI
      }
    },
    staleTime: 1000 * 30, // 30 secondes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
