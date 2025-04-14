
import { useQuery } from "@tanstack/react-query";
import { DeliveryNote } from "@/types/delivery-note";
import { db } from "@/utils/db-adapter";

export function useFetchDeliveryNote(id: string | undefined) {
  return useQuery({
    queryKey: ['delivery-note', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      
      console.log("Fetching delivery note with ID:", id);
      try {
        // Use single() to ensure we get a single object, not an array
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
            .eq('id', id)
            .eq('deleted', false)
            .single()
        );

        if (!result) {
          console.error("Delivery note not found");
          return null;
        }

        // Process items with proper typing - ensure result.items is treated as an array
        const items = Array.isArray(result.items) ? result.items.map(item => {
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

        // Handle supplier safely - make sure result is treated as an object, not an array
        const supplier = result.supplier ? {
          id: result.supplier.id || '',
          name: result.supplier.name || 'Fournisseur inconnu',
          phone: result.supplier.phone || '',
          email: result.supplier.email || ''
        } : { 
          id: '',
          name: 'Fournisseur inconnu', 
          phone: '', 
          email: '' 
        };
        
        // Handle purchase order safely - make sure result is treated as an object, not an array
        const purchaseOrder = result.purchase_order ? {
          id: result.purchase_order.id || '',
          order_number: result.purchase_order.order_number || '',
          total_amount: result.purchase_order.total_amount || 0
        } : { 
          id: '',
          order_number: '', 
          total_amount: 0 
        };

        return {
          id: result.id || '',
          delivery_number: result.delivery_number || `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          created_at: result.created_at || '',
          updated_at: result.updated_at || '',
          notes: result.notes || '',
          status: result.status || 'pending',
          supplier,
          purchase_order: purchaseOrder,
          items: items
        } as DeliveryNote;
      } catch (error) {
        console.error("Error fetching delivery note:", error);
        return null;
      }
    }
  });
}
