
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePurchaseOrders = () => {
  const queryClient = useQueryClient();

  // Add implementations for missing properties
  const usePurchaseOrdersQuery = () => useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier_id(id, company_name, contact_name),
          warehouse:warehouse_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: orders = [], isLoading } = usePurchaseOrdersQuery();

  const usePurchaseOrderQuery = (id: string) => useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier_id(id, company_name, contact_name, email, phone, address),
          warehouse:warehouse_id(id, name, location)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: currentOrder, isLoading: isLoadingOrder } = usePurchaseOrderQuery('');

  const usePurchaseOrdersBySupplierQuery = (supplierId: string) => useQuery({
    queryKey: ['purchase-orders-by-supplier', supplierId],
    queryFn: async () => {
      if (!supplierId) return [];
      
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!supplierId
  });

  const usePurchaseOrderItemsQuery = (orderId: string) => useQuery({
    queryKey: ['purchase-order-items', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select(`
          *,
          product:product_id(id, name, reference)
        `)
        .eq('purchase_order_id', orderId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orderId
  });

  // Add handlers for CRUD operations
  const handleCreate = async (data: any) => {
    try {
      // Create the purchase order
      const { data: newOrder, error } = await supabase
        .from('purchase_orders')
        .insert([{
          order_number: data.orderNumber,
          supplier_id: data.supplierId,
          warehouse_id: data.warehouseId,
          expected_delivery_date: data.expectedDeliveryDate,
          notes: data.notes,
          order_status: data.orderStatus,
          payment_status: data.paymentStatus,
          paid_amount: data.paidAmount || 0,
          total: data.total,
          tax_rate: data.taxRate || 0,
          discount: data.discount || 0,
          shipping_cost: data.shippingCost || 0,
          logistics_cost: data.logisticsCost || 0,
          transit_cost: data.transitCost || 0
        }])
        .select()
        .single();

      if (error) throw error;

      // Create order items
      if (data.items && data.items.length > 0) {
        const orderItems = data.items.map((item: any) => ({
          purchase_order_id: newOrder.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.total
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      toast.success("Bon de commande créé avec succès");
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      
      return newOrder;
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast.error("Erreur lors de la création du bon de commande");
      throw error;
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ order_status: 'approved' })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Bon de commande approuvé avec succès");
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    } catch (error) {
      console.error("Error approving purchase order:", error);
      toast.error("Erreur lors de l'approbation du bon de commande");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // First delete related order items
      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', id);
      
      if (itemsError) throw itemsError;
      
      // Then delete the order itself
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Bon de commande supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast.error("Erreur lors de la suppression du bon de commande");
    }
  };

  const handleEdit = async (id: string, data: any) => {
    try {
      // Update the purchase order
      const { error } = await supabase
        .from('purchase_orders')
        .update({
          order_number: data.orderNumber,
          supplier_id: data.supplierId,
          warehouse_id: data.warehouseId,
          expected_delivery_date: data.expectedDeliveryDate,
          notes: data.notes,
          order_status: data.orderStatus,
          payment_status: data.paymentStatus,
          paid_amount: data.paidAmount || 0,
          total: data.total,
          tax_rate: data.taxRate || 0,
          discount: data.discount || 0,
          shipping_cost: data.shippingCost || 0,
          logistics_cost: data.logisticsCost || 0,
          transit_cost: data.transitCost || 0
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete existing order items
      const { error: deleteItemsError } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', id);
      
      if (deleteItemsError) throw deleteItemsError;
      
      // Create new order items
      if (data.items && data.items.length > 0) {
        const orderItems = data.items.map((item: any) => ({
          purchase_order_id: id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.total
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }
      
      toast.success("Bon de commande modifié avec succès");
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    } catch (error) {
      console.error("Error editing purchase order:", error);
      toast.error("Erreur lors de la modification du bon de commande");
    }
  };

  return {
    usePurchaseOrdersQuery,
    usePurchaseOrderQuery,
    usePurchaseOrdersBySupplierQuery,
    usePurchaseOrderItemsQuery,
    handleCreate,
    handleApprove,
    handleDelete,
    handleEdit,
    orders,
    isLoading,
    currentOrder,
    isLoadingOrder
  };
};
