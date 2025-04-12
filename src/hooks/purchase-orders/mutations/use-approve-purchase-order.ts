
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { toast } from "sonner";
import { DeliveryNote } from "@/types/delivery-note";
import { isSelectQueryError } from "@/utils/supabase-helpers";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const approvePurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
    try {
      // 1. Update purchase order status to approved
      const { data: updatedOrder, error: updateError } = await supabase
        .from("purchase_orders")
        .update({ status: "approved" as const })
        .eq("id", id)
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .single();

      if (updateError) throw updateError;

      // 2. Get purchase order items
      const { data: orderItems, error: itemsError } = await supabase
        .from("purchase_order_items")
        .select("*")
        .eq("purchase_order_id", id);

      if (itemsError) throw itemsError;

      // 3. Create delivery note
      const { data: deliveryNote, error: deliveryError } = await supabase
        .from("delivery_notes")
        .insert({
          purchase_order_id: id,
          supplier_id: updatedOrder.supplier_id,
          delivery_number: `DN-${Date.now().toString().slice(-6)}`,
          status: "pending",
        })
        .select("*")
        .single();

      if (deliveryError) throw deliveryError;

      // 4. Create delivery note items
      const deliveryItems = orderItems.map((item) => ({
        delivery_note_id: deliveryNote.id,
        product_id: item.product_id,
        expected_quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      if (deliveryItems.length > 0) {
        const { error: deliveryItemsError } = await supabase
          .from("delivery_note_items")
          .insert(deliveryItems);

        if (deliveryItemsError) throw deliveryItemsError;
      }

      // Create default supplier object for fallback
      const defaultSupplier = { 
        id: '', 
        name: 'Unknown Supplier', 
        phone: '', 
        email: '' 
      };

      // Safely handle supplier data
      const supplier = isSelectQueryError(updatedOrder.supplier) 
        ? defaultSupplier
        : {
            id: updatedOrder.supplier?.id || defaultSupplier.id,
            name: updatedOrder.supplier?.name || defaultSupplier.name,
            phone: updatedOrder.supplier?.phone || defaultSupplier.phone,
            email: updatedOrder.supplier?.email || defaultSupplier.email
          };

      // Cast payment_status to the correct type
      const paymentStatus = updatedOrder.payment_status as "pending" | "partial" | "paid";

      const purchaseOrder: PurchaseOrder = {
        ...updatedOrder,
        supplier,
        items: orderItems,
        status: updatedOrder.status as "pending" | "delivered" | "draft" | "approved",
        payment_status: paymentStatus
      };

      return purchaseOrder;
    } catch (error) {
      console.error("Error approving purchase order:", error);
      throw error;
    }
  };

  return useMutation({
    mutationFn: approvePurchaseOrder,
    onSuccess: (data) => {
      toast.success("Bon de commande approuvé avec succès");
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", data.id] });
      queryClient.invalidateQueries({ queryKey: ["delivery-notes"] });
    },
    onError: (error) => {
      console.error("Error in approvePurchaseOrder mutation:", error);
      toast.error("Erreur lors de l'approbation du bon de commande");
    },
  });
}
