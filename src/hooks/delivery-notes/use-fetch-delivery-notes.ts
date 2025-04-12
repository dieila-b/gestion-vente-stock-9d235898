
import { useQuery } from "@tanstack/react-query";
import { DeliveryNote } from "@/types/delivery-note";
import { db } from "@/utils/db-adapter";

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
            .order('created_at', { ascending: false })
        );

        if (!Array.isArray(deliveryNotesData)) {
          console.error("Error: delivery notes data is not an array", deliveryNotesData);
          return [];
        }
        
        const transformedData = deliveryNotesData.map(note => {
          if (!note) return null;
          
          // Handle items safely
          const itemsData = note.items || [];
          const items = Array.isArray(itemsData) ? itemsData.map(item => {
            if (!item) return null;
            
            return {
              id: item.id || '',
              product_id: item.product_id || '',
              quantity_ordered: item.quantity_ordered || 0,
              quantity_received: item.quantity_received || 0,
              unit_price: item.unit_price || 0,
              product: {
                name: item.product?.name || 'Produit non disponible',
                reference: item.product?.reference || '',
                category: item.product?.category || ''
              }
            };
          }).filter(Boolean) : [];

          // Handle supplier safely
          const supplier = note.supplier || { name: 'Fournisseur inconnu', phone: '', email: '' };
          
          // Handle purchase order safely
          const purchaseOrder = note.purchase_order || { order_number: '', total_amount: 0 };

          return {
            id: note.id || '',
            delivery_number: note.delivery_number || '',
            created_at: note.created_at || '',
            updated_at: note.updated_at || '',
            notes: note.notes || '',
            status: note.status || '',
            supplier: {
              name: supplier.name || 'Fournisseur inconnu',
              phone: supplier.phone || '',
              email: supplier.email || ''
            },
            purchase_order: {
              order_number: purchaseOrder.order_number || '',
              total_amount: purchaseOrder.total_amount || 0
            },
            items: items
          } as DeliveryNote;
        }).filter(Boolean) as DeliveryNote[];
      
        return transformedData;
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
        return [];
      }
    }
  });
}
