
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
        // Explicitly add .single() to ensure we get a single object, not an array
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

        // Explicitly type the result to avoid TypeScript errors
        const typedResult = result as {
          id?: string;
          delivery_number?: string;
          created_at?: string;
          updated_at?: string;
          notes?: string;
          status?: string;
          supplier?: {
            id?: string;
            name?: string;
            phone?: string;
            email?: string;
          };
          purchase_order?: {
            id?: string;
            order_number?: string;
            total_amount?: number;
          };
          items?: Array<{
            id?: string;
            product_id?: string;
            quantity_ordered?: number;
            quantity_received?: number;
            unit_price?: number;
            product?: {
              id?: string;
              name?: string;
              reference?: string;
            };
          }>;
        };

        // Process items with proper typing
        const items = Array.isArray(typedResult.items) ? typedResult.items.map(item => {
          return {
            id: item.id || '',
            product_id: item.product_id || '',
            quantity_ordered: item.quantity_ordered || 0,
            quantity_received: item.quantity_received || 0,
            unit_price: item.unit_price || 0,
            product: {
              id: item.product?.id || '',
              name: item.product?.name || 'Produit non disponible',
              reference: item.product?.reference || ''
            }
          };
        }) : [];

        // Handle supplier safely
        const supplier = typedResult.supplier ? {
          id: typedResult.supplier.id || '',
          name: typedResult.supplier.name || 'Fournisseur inconnu',
          phone: typedResult.supplier.phone || '',
          email: typedResult.supplier.email || ''
        } : { 
          id: '',
          name: 'Fournisseur inconnu', 
          phone: '', 
          email: '' 
        };
        
        // Handle purchase order safely
        const purchaseOrder = typedResult.purchase_order ? {
          id: typedResult.purchase_order.id || '',
          order_number: typedResult.purchase_order.order_number || '',
          total_amount: typedResult.purchase_order.total_amount || 0
        } : { 
          id: '',
          order_number: '', 
          total_amount: 0 
        };

        return {
          id: typedResult.id || '',
          delivery_number: typedResult.delivery_number || '',
          created_at: typedResult.created_at || '',
          updated_at: typedResult.updated_at || '',
          notes: typedResult.notes || '',
          status: typedResult.status || '',
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
