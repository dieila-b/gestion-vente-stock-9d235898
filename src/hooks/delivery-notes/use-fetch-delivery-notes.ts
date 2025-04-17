
import { useQuery } from "@tanstack/react-query";
import { DeliveryNote } from "@/types/delivery-note";
import { db } from "@/utils/db-adapter";

export function useFetchDeliveryNotes() {
  return useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      console.log("Fetching delivery notes...");
      try {
        const result = await db.query(
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
              purchase_order:purchase_orders (
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
                product:catalog (
                  id,
                  name,
                  reference
                )
              )
            `)
            .eq('deleted', false)
            .order('created_at', { ascending: false })
        );

        console.log("Fetched delivery notes:", result);
        
        // Transform and clean up the data
        const deliveryNotes = Array.isArray(result) ? result.map(note => {
          // Handle supplier safely
          const supplier = note && note.supplier ? {
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
          const purchaseOrder = note && note.purchase_order ? {
            id: note.purchase_order.id || '',
            order_number: note.purchase_order.order_number || '',
            total_amount: note.purchase_order.total_amount || 0
          } : { 
            id: '',
            order_number: 'N/A', 
            total_amount: 0 
          };

          // Process items with proper typing
          const items = note && note.items && Array.isArray(note.items) ? note.items.map(item => {
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
          
          return {
            id: note.id || '',
            delivery_number: note.delivery_number || `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            created_at: note.created_at || '',
            updated_at: note.updated_at || '',
            notes: note.notes || '',
            status: note.status || 'pending',
            supplier,
            purchase_order: purchaseOrder,
            items
          } as DeliveryNote;
        }) : [];
        
        console.log("Transformed delivery notes:", deliveryNotes);
        return deliveryNotes;
      } catch (error) {
        console.error("Error fetching delivery notes:", error);
        return [];
      }
    }
  });
}
