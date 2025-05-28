
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";

export function useFetchDeliveryNote(id: string | undefined) {
  return useQuery({
    queryKey: ['delivery-note', id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Delivery note ID is required");
      }

      console.log(`🔍 Fetching delivery note with ID: ${id}`);
      
      const { data: deliveryNote, error } = await supabase
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
          supplier:suppliers(
            id,
            name,
            email,
            phone
          ),
          purchase_order:purchase_orders(
            id,
            order_number,
            total_amount
          ),
          items:delivery_note_items(
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
          )
        `)
        .eq('id', id)
        .eq('deleted', false)
        .single();

      if (error) {
        console.error("❌ Error fetching delivery note:", error);
        throw error;
      }

      if (!deliveryNote) {
        throw new Error("Delivery note not found");
      }

      console.log("📦 Delivery note fetched:", deliveryNote);

      // Transform the data to match our TypeScript interfaces
      const transformedNote: DeliveryNote = {
        id: deliveryNote.id,
        delivery_number: deliveryNote.delivery_number,
        created_at: deliveryNote.created_at,
        updated_at: deliveryNote.updated_at,
        status: deliveryNote.status,
        notes: deliveryNote.notes,
        purchase_order_id: deliveryNote.purchase_order_id,
        supplier_id: deliveryNote.supplier_id,
        warehouse_id: deliveryNote.warehouse_id,
        deleted: deliveryNote.deleted,
        supplier: deliveryNote.supplier ? {
          id: deliveryNote.supplier.id,
          name: deliveryNote.supplier.name,
          phone: deliveryNote.supplier.phone || '',
          email: deliveryNote.supplier.email || ''
        } : undefined,
        purchase_order: deliveryNote.purchase_order ? {
          id: deliveryNote.purchase_order.id,
          order_number: deliveryNote.purchase_order.order_number,
          total_amount: deliveryNote.purchase_order.total_amount
        } : undefined,
        items: (deliveryNote.items || []).map(item => ({
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
          } : undefined
        }))
      };

      console.log("✅ Transformed delivery note:", transformedNote);
      return transformedNote;
    },
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
