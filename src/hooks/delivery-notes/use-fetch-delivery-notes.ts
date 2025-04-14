
import { useQuery } from "@tanstack/react-query";
import { DeliveryNote } from "@/types/delivery-note";
import { db } from "@/utils/db-adapter";
import { isSelectQueryError, safeSupplier } from "@/utils/type-utils";
import { formatDate } from "@/lib/formatters";

export function useFetchDeliveryNotes() {
  return useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      console.log("Fetching delivery notes...");
      try {
        const deliveryNotesData = await db.query(
          'delivery_notes',
          query => query
            .select(`
              id,
              delivery_number,
              created_at,
              updated_at,
              notes,
              status,
              supplier:suppliers (
                id,
                name,
                phone,
                email
              ),
              purchase_order:purchase_orders!delivery_notes_purchase_order_id_fkey (
                id,
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
                  id,
                  name,
                  reference
                )
              )
            `)
            .eq('deleted', false)
            .order('created_at', { ascending: false })
        );

        console.log("Fetched delivery notes:", deliveryNotesData);

        if (!Array.isArray(deliveryNotesData)) {
          console.error("Error: delivery notes data is not an array", deliveryNotesData);
          return [];
        }
        
        // Filter out null or undefined items
        const filteredData = deliveryNotesData.filter(note => note !== null && note !== undefined);
        
        if (filteredData.length === 0) {
          console.log("No valid delivery notes found");
          return [];
        }

        const transformedData = filteredData.map(note => {
          // Handle items safely
          const items = Array.isArray(note.items) ? note.items.map(item => {
            if (!item) return null;
            
            return {
              id: item.id || '',
              product_id: item.product_id || '',
              quantity_ordered: item.quantity_ordered || 0,
              quantity_received: item.quantity_received || 0,
              unit_price: item.unit_price || 0,
              product: item.product ? {
                id: item.product.id || '',
                name: item.product.name || 'Produit non disponible',
                reference: item.product.reference || ''
              } : {
                id: '',
                name: 'Produit non disponible',
                reference: ''
              }
            };
          }).filter(Boolean) : [];

          // Handle supplier safely
          const supplier = note.supplier ? {
            id: note.supplier.id || '',
            name: note.supplier.name || 'Fournisseur inconnu',
            phone: note.supplier.phone || '',
            email: note.supplier.email || ''
          } : {
            id: '',
            name: 'Fournisseur inconnu',
            phone: '',
            email: ''
          };
          
          // Handle purchase order safely
          const purchaseOrder = note.purchase_order ? {
            id: note.purchase_order.id || '',
            order_number: note.purchase_order.order_number || 'N/A',
            total_amount: note.purchase_order.total_amount || 0
          } : {
            id: '',
            order_number: 'N/A',
            total_amount: 0
          };

          return {
            id: note.id || '',
            delivery_number: note.delivery_number || 'BL-XXXX',
            created_at: note.created_at || new Date().toISOString(),
            updated_at: note.updated_at || new Date().toISOString(),
            notes: note.notes || '',
            status: note.status || 'pending',
            supplier,
            purchase_order: purchaseOrder,
            items
          } as DeliveryNote;
        });
      
        console.log("Transformed delivery notes:", transformedData);
        return transformedData;
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
        return [];
      }
    }
  });
}
