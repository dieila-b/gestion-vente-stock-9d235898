
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
        // Execute the query and get the result
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
            .eq('id', id)
            .eq('deleted', false)
            .single()
        );

        console.log("Raw query result:", result);
        
        if (!result) {
          console.error("Delivery note not found");
          return null;
        }

        // Ensure result is treated as an object, not an array
        const deliveryNoteData = result as any;

        // Process items with proper typing
        const items = deliveryNoteData.items && Array.isArray(deliveryNoteData.items) 
          ? deliveryNoteData.items.map((item: any) => {
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
            }).filter(Boolean) 
          : [];

        // Handle supplier safely
        const supplier = deliveryNoteData.supplier 
          ? {
              id: deliveryNoteData.supplier.id || '',
              name: deliveryNoteData.supplier.name || 'Fournisseur inconnu',
              phone: deliveryNoteData.supplier.phone || '',
              email: deliveryNoteData.supplier.email || ''
            } 
          : { 
              id: '',
              name: 'Fournisseur inconnu', 
              phone: '', 
              email: '' 
            };
        
        // Handle purchase order safely
        const purchaseOrder = deliveryNoteData.purchase_order 
          ? {
              id: deliveryNoteData.purchase_order.id || '',
              order_number: deliveryNoteData.purchase_order.order_number || '',
              total_amount: deliveryNoteData.purchase_order.total_amount || 0
            } 
          : { 
              id: '',
              order_number: 'N/A', 
              total_amount: 0 
            };

        // Construct the delivery note with proper typing
        const deliveryNote: DeliveryNote = {
          id: deliveryNoteData.id || '',
          delivery_number: deliveryNoteData.delivery_number || `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          created_at: deliveryNoteData.created_at || '',
          updated_at: deliveryNoteData.updated_at || '',
          notes: deliveryNoteData.notes || '',
          status: deliveryNoteData.status || 'pending',
          supplier,
          purchase_order: purchaseOrder,
          items
        };

        console.log("Processed delivery note:", deliveryNote);
        return deliveryNote;
      } catch (error) {
        console.error("Error fetching delivery note:", error);
        return null;
      }
    }
  });
}
