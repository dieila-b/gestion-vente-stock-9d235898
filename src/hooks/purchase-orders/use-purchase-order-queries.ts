
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { isSelectQueryError, safeGetProperty } from "@/utils/supabase-helpers";

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
        let supplier = defaultSupplier;
        if (order.supplier && !isSelectQueryError(order.supplier)) {
          supplier = {
            id: order.supplier.id || "",
            name: order.supplier.name || "Unknown Supplier",
            phone: order.supplier.phone || "",
            email: order.supplier.email || "",
          };
        }

        // Safely handle warehouse
        const warehouse = isSelectQueryError(order.warehouse)
          ? defaultWarehouse
          : order.warehouse || defaultWarehouse;

        // Return the processed order with an empty items array
        return {
          ...order,
          supplier,
          warehouse,
          items: []
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
      let supplier = defaultSupplier;
      if (data.supplier && !isSelectQueryError(data.supplier)) {
        supplier = {
          id: data.supplier.id || "",
          name: data.supplier.name || "Unknown Supplier",
          phone: data.supplier.phone || "",
          email: data.supplier.email || "",
        };
      }

      // Safely handle warehouse
      const warehouse = isSelectQueryError(data.warehouse)
        ? defaultWarehouse
        : data.warehouse || defaultWarehouse;

      return {
        ...data,
        supplier,
        warehouse,
        items: Array.isArray(data.items) ? data.items : []
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
