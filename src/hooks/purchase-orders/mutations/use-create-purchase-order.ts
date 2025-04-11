
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { toast } from "sonner";
import { isSelectQueryError, safeGetProperty } from "@/utils/supabase-helpers";

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  const createPurchaseOrder = async (purchaseOrderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    try {
      // Ensure we have all required fields
      const newOrderData = {
        supplier_id: purchaseOrderData.supplier_id || (purchaseOrderData.supplier?.id ?? ""),
        order_number: purchaseOrderData.order_number || `PO-${Date.now().toString().slice(-6)}`,
        expected_delivery_date: purchaseOrderData.expected_delivery_date,
        warehouse_id: purchaseOrderData.warehouse_id,
        notes: purchaseOrderData.notes,
        status: purchaseOrderData.status || "pending",
        total_amount: purchaseOrderData.total_amount || 0,
        payment_status: purchaseOrderData.payment_status || "pending",
        paid_amount: purchaseOrderData.paid_amount || 0,
        logistics_cost: purchaseOrderData.logistics_cost || 0,
        transit_cost: purchaseOrderData.transit_cost || 0,
        tax_rate: purchaseOrderData.tax_rate || 0,
        subtotal: purchaseOrderData.subtotal || 0,
        tax_amount: purchaseOrderData.tax_amount || 0,
        total_ttc: purchaseOrderData.total_ttc || 0,
        shipping_cost: purchaseOrderData.shipping_cost || 0,
        discount: purchaseOrderData.discount || 0,
        deleted: purchaseOrderData.deleted || false
      };

      // Create the purchase order
      const { data, error } = await supabase
        .from("purchase_orders")
        .insert(newOrderData)
        .select(`
          *,
          supplier:suppliers(*),
          warehouse:warehouses(*)
        `)
        .single();

      if (error) throw error;

      // Process supplier data
      const defaultSupplier = {
        id: "",
        name: "Unknown Supplier",
        phone: "",
        email: ""
      };

      // Safely handle supplier data
      let supplier = defaultSupplier;

      if (data.supplier && !isSelectQueryError(data.supplier)) {
        supplier = {
          id: data.supplier.id || "",
          name: data.supplier.name || "Unknown Supplier",
          phone: data.supplier.phone || "",
          email: data.supplier.email || ""
        };
      }

      // Return processed purchase order
      return {
        ...data,
        supplier,
        items: []
      } as PurchaseOrder;
    } catch (error) {
      console.error("Error creating purchase order:", error);
      throw error;
    }
  };

  return useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Bon de commande créé avec succès");
    },
    onError: (error) => {
      console.error("Error in createPurchaseOrder mutation:", error);
      toast.error("Erreur lors de la création du bon de commande");
    }
  });
}
