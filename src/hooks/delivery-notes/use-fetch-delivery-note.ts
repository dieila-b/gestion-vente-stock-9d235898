
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
        // Get the result as an array and then extract the first item
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

        // Since db.query returns array, check if it's empty
        if (!result || Array.isArray(result) && result.length === 0) {
          console.error("Delivery note not found");
          return null;
        }

        // Get the actual result data (first item if array, or the item itself)
        const deliveryNote = Array.isArray(result) ? result[0] : result;
        
        if (!deliveryNote) {
          console.error("Delivery note data is invalid");
          return null;
        }

        // Process items with proper typing
        const resultItems = Array.isArray(deliveryNote.items) ? deliveryNote.items : [];
        const items = resultItems.map(item => {
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
        }).filter(Boolean);

        // Handle supplier safely
        const resultSupplier = deliveryNote.supplier || null;
        const supplier = resultSupplier ? {
          id: resultSupplier.id || '',
          name: resultSupplier.name || 'Fournisseur inconnu',
          phone: resultSupplier.phone || '',
          email: resultSupplier.email || ''
        } : { 
          id: '',
          name: 'Fournisseur inconnu', 
          phone: '', 
          email: '' 
        };
        
        // Handle purchase order safely
        const resultPurchaseOrder = deliveryNote.purchase_order || null;
        const purchaseOrder = resultPurchaseOrder ? {
          id: resultPurchaseOrder.id || '',
          order_number: resultPurchaseOrder.order_number || '',
          total_amount: resultPurchaseOrder.total_amount || 0
        } : { 
          id: '',
          order_number: '', 
          total_amount: 0 
        };

        return {
          id: deliveryNote.id || '',
          delivery_number: deliveryNote.delivery_number || `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          created_at: deliveryNote.created_at || '',
          updated_at: deliveryNote.updated_at || '',
          notes: deliveryNote.notes || '',
          status: deliveryNote.status || 'pending',
          supplier,
          purchase_order: purchaseOrder,
          items
        } as DeliveryNote;
      } catch (error) {
        console.error("Error fetching delivery note:", error);
        return null;
      }
    }
  });
}
