
import { useQuery } from "@tanstack/react-query";
import { DeliveryNote } from "@/types/delivery-note";
import { supabase } from "@/integrations/supabase/client";

export function useFetchDeliveryNote(id: string | undefined) {
  return useQuery({
    queryKey: ['delivery-note', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      
      console.log("Fetching delivery note with ID:", id);
      try {
        // Fetch delivery note with all related data including items
        const { data: deliveryNote, error } = await supabase
          .from('delivery_notes')
          .select(`
            id,
            delivery_number,
            created_at,
            updated_at,
            notes,
            status,
            supplier_id,
            purchase_order_id,
            warehouse_id,
            deleted,
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
          .single();

        if (error) {
          console.error("Error fetching delivery note:", error);
          throw error;
        }

        if (!deliveryNote) {
          console.error("Delivery note not found");
          return null;
        }

        console.log("Raw delivery note data:", deliveryNote);

        // Process and structure the data properly
        const processedNote: DeliveryNote = {
          id: deliveryNote.id || '',
          delivery_number: deliveryNote.delivery_number || `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          created_at: deliveryNote.created_at || '',
          updated_at: deliveryNote.updated_at || '',
          notes: deliveryNote.notes || '',
          status: deliveryNote.status || 'pending',
          supplier_id: deliveryNote.supplier_id,
          purchase_order_id: deliveryNote.purchase_order_id,
          warehouse_id: deliveryNote.warehouse_id,
          deleted: deliveryNote.deleted || false,
          supplier: deliveryNote.supplier ? {
            id: deliveryNote.supplier.id || '',
            name: deliveryNote.supplier.name || 'Fournisseur inconnu',
            phone: deliveryNote.supplier.phone || '',
            email: deliveryNote.supplier.email || ''
          } : {
            id: '',
            name: 'Fournisseur inconnu',
            phone: '',
            email: ''
          },
          purchase_order: deliveryNote.purchase_order ? {
            id: deliveryNote.purchase_order.id || '',
            order_number: deliveryNote.purchase_order.order_number || '',
            total_amount: deliveryNote.purchase_order.total_amount || 0
          } : {
            id: '',
            order_number: 'N/A',
            total_amount: 0
          },
          items: deliveryNote.items && Array.isArray(deliveryNote.items) 
            ? deliveryNote.items.map((item: any) => ({
                id: item.id || '',
                delivery_note_id: deliveryNote.id,
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
              }))
            : []
        };

        console.log("Processed delivery note with items:", processedNote);
        console.log("Number of items:", processedNote.items.length);
        
        return processedNote;
      } catch (error) {
        console.error("Error in delivery note fetch:", error);
        throw error;
      }
    }
  });
}
