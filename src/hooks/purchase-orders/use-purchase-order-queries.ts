
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";
import { safeSupplier } from "@/utils/supabase-safe-query";

export function usePurchaseOrderQueries() {
  // Get all purchase orders
  const usePurchaseOrdersQuery = () => {
    return useQuery({
      queryKey: ['purchase-orders'],
      queryFn: async () => {
        try {
          const orders = await db.query(
            'purchase_orders',
            query => query
              .select(`
                *,
                supplier:supplier_id(*),
                warehouse:warehouse_id(*)
              `)
              .order('created_at', { ascending: false }),
            []
          );

          return orders.map((order: any) => {
            // Format supplier data using our safe accessor
            const supplier = safeSupplier(order.supplier || {});
            
            return {
              ...order,
              supplier: {
                name: supplier.name || "Unknown Supplier",
                phone: supplier.phone || "",
                email: supplier.email || ""
              }
            };
          });
        } catch (error) {
          console.error("Error fetching purchase orders:", error);
          return [];
        }
      }
    });
  };

  // Get a purchase order by ID
  const usePurchaseOrderQuery = (id: string) => {
    return useQuery({
      queryKey: ['purchase-order', id],
      queryFn: async () => {
        try {
          const orderResult = await db.query(
            'purchase_orders',
            query => query
              .select(`
                *,
                supplier:supplier_id(*),
                warehouse:warehouse_id(*),
                items:purchase_order_items(
                  *,
                  product:product_id(*)
                )
              `)
              .eq('id', id)
              .single(),
            null
          );

          // Extract order from array if needed
          const order = Array.isArray(orderResult) && orderResult.length > 0 
            ? orderResult[0] 
            : orderResult;

          if (!order) {
            throw new Error("Purchase order not found");
          }

          // Format supplier data using our safe accessor
          const supplier = safeSupplier(order.supplier || {});
          
          // Add extra attributes that the UI expects
          return {
            ...order,
            supplier: {
              name: supplier.name || "Unknown Supplier",
              phone: supplier.phone || "",
              email: supplier.email || ""
            },
            // Explicit cast for properties not in the database schema
            deleted: false as boolean,
            // Convert unknown types to proper types expected by the UI
            logistics_cost: Number(order.logistics_cost || 0),
            transit_cost: Number(order.transit_cost || 0)
          };
        } catch (error) {
          console.error("Error fetching purchase order:", error);
          return null;
        }
      },
      enabled: !!id
    });
  };

  // Get purchase orders by supplier
  const usePurchaseOrdersBySupplierQuery = (supplierId: string) => {
    return useQuery({
      queryKey: ['purchase-orders-by-supplier', supplierId],
      queryFn: async () => {
        try {
          const orders = await db.query(
            'purchase_orders',
            query => query
              .select(`
                *,
                supplier:supplier_id(*),
                warehouse:warehouse_id(*)
              `)
              .eq('supplier_id', supplierId)
              .order('created_at', { ascending: false }),
            []
          );

          return orders.map((order: any) => {
            // Format supplier data using our safe accessor
            const supplier = safeSupplier(order.supplier || {});
            
            return {
              ...order,
              supplier: {
                name: supplier.name || "Unknown Supplier",
                phone: supplier.phone || "",
                email: supplier.email || ""
              },
              deleted: false
            };
          });
        } catch (error) {
          console.error("Error fetching purchase orders by supplier:", error);
          return [];
        }
      },
      enabled: !!supplierId
    });
  };

  // Get purchase order items by order ID
  const usePurchaseOrderItemsQuery = (orderId: string) => {
    return useQuery({
      queryKey: ['purchase-order-items', orderId],
      queryFn: async () => {
        try {
          const items = await db.query(
            'purchase_order_items',
            query => query
              .select(`
                *,
                product:product_id(*)
              `)
              .eq('purchase_order_id', orderId)
              .order('created_at', { ascending: false }),
            []
          );

          return items;
        } catch (error) {
          console.error("Error fetching purchase order items:", error);
          return [];
        }
      },
      enabled: !!orderId
    });
  };

  return {
    usePurchaseOrdersQuery,
    usePurchaseOrderQuery,
    usePurchaseOrdersBySupplierQuery,
    usePurchaseOrderItemsQuery
  };
}
