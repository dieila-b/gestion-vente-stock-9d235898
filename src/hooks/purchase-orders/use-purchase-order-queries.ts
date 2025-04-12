
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { isSelectQueryError } from "@/utils/supabase-helpers";

export function usePurchaseOrderQueries(
  status: string | null = null,
  searchTerm: string | null = null
) {
  const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    try {
      let query = supabase
        .from("purchase_orders")
        .select(`
          *,
          supplier:suppliers(*),
          warehouse:warehouses(*)
        `)
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      if (searchTerm) {
        query = query.or(
          `order_number.ilike.%${searchTerm}%,supplier.name.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedOrders = data.map((order) => {
        const defaultSupplier = {
          id: "",
          name: "Unknown Supplier",
          phone: "",
          email: "",
        };

        const defaultWarehouse = {
          id: "",
          name: "Unknown Warehouse",
        };

        // Safely handle supplier
        const supplier = isSelectQueryError(order.supplier) 
          ? defaultSupplier
          : {
              id: order.supplier?.id || defaultSupplier.id,
              name: order.supplier?.name || defaultSupplier.name,
              phone: order.supplier?.phone || defaultSupplier.phone,
              email: order.supplier?.email || defaultSupplier.email
            };

        // Safely handle warehouse
        const warehouse = isSelectQueryError(order.warehouse)
          ? defaultWarehouse
          : order.warehouse || defaultWarehouse;

        // Cast status and payment_status to their respective types
        const orderStatus = order.status as "pending" | "delivered" | "draft" | "approved";
        const paymentStatus = order.payment_status as "pending" | "partial" | "paid";

        // Return the processed order with an empty items array
        return {
          ...order,
          supplier,
          warehouse,
          items: [],
          status: orderStatus,
          payment_status: paymentStatus
        } as PurchaseOrder;
      });

      return processedOrders;
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      throw error;
    }
  };

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["purchase-orders", status, searchTerm],
    queryFn: fetchPurchaseOrders,
  });

  const fetchPurchaseOrder = async (id: string): Promise<PurchaseOrder | null> => {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          supplier:suppliers(*),
          warehouse:warehouses(*),
          items:purchase_order_items(
            *,
            product:catalog(*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      const defaultSupplier = {
        id: "",
        name: "Unknown Supplier",
        phone: "",
        email: "",
      };

      const defaultWarehouse = {
        id: "",
        name: "Unknown Warehouse",
      };

      // Safely handle supplier
      const supplier = isSelectQueryError(data.supplier) 
        ? defaultSupplier
        : {
            id: data.supplier?.id || defaultSupplier.id,
            name: data.supplier?.name || defaultSupplier.name,
            phone: data.supplier?.phone || defaultSupplier.phone,
            email: data.supplier?.email || defaultSupplier.email
          };

      // Safely handle warehouse
      const warehouse = isSelectQueryError(data.warehouse)
        ? defaultWarehouse
        : data.warehouse || defaultWarehouse;

      // Cast status and payment_status to their respective types
      const orderStatus = data.status as "pending" | "delivered" | "draft" | "approved";
      const paymentStatus = data.payment_status as "pending" | "partial" | "paid";

      return {
        ...data,
        supplier,
        warehouse,
        items: Array.isArray(data.items) ? data.items : [],
        status: orderStatus,
        payment_status: paymentStatus
      } as PurchaseOrder;
    } catch (error) {
      console.error(`Error fetching purchase order ${id}:`, error);
      return null;
    }
  };

  const getStatusCounts = async () => {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("status");

      if (error) throw error;

      const counts = {
        total: data.length,
        pending: data.filter((order) => order.status === "pending").length,
        draft: data.filter((order) => order.status === "draft").length,
        approved: data.filter((order) => order.status === "approved").length,
        delivered: data.filter((order) => order.status === "delivered").length,
      };

      return counts;
    } catch (error) {
      console.error("Error fetching status counts:", error);
      return { total: 0, pending: 0, draft: 0, approved: 0, delivered: 0 };
    }
  };

  return {
    purchaseOrders: data,
    isLoading,
    error,
    fetchPurchaseOrder,
    getStatusCounts,
  };
}
