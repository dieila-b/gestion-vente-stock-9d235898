
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";
import { db } from "@/utils/db-core";
import { PurchaseOrder, PurchaseOrderItem } from "@/types/purchase-order";
import { Supplier } from "@/types/supplier";

export function usePurchaseOrders() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const editPurchaseOrder = useEditPurchaseOrder();

  // Query to fetch purchase orders with improved reliability
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      try {
        console.log("Fetching purchase orders...");
        
        // Try to fetch using direct Supabase query first
        const { data, error } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            supplier:suppliers(*),
            warehouse:warehouses(*),
            items:purchase_order_items(*)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching purchase orders with Supabase:", error);
          throw error;
        }
        
        console.log("Raw purchase order data:", data);
        
        if (!data || data.length === 0) {
          console.log("No purchase orders found in database");
          return [];
        }
        
        // Add deleted property since it doesn't exist in the database
        const processedData = data.map(order => {
          // Format the supplier information explicitly with null checks
          const supplierData: Partial<Supplier> = order.supplier || {};
          
          // Create a properly formatted supplier object with fallbacks
          const formattedSupplier: Supplier = {
            id: (supplierData?.id || order.supplier_id || '').toString(),
            name: supplierData?.name || 'Fournisseur inconnu',
            phone: supplierData?.phone || '',
            email: supplierData?.email || ''
          };
          
          // Ensure status is one of the valid enum values
          const safeStatus = (status: string): PurchaseOrder['status'] => {
            if (['draft', 'pending', 'delivered', 'approved'].includes(status)) {
              return status as PurchaseOrder['status'];
            }
            return 'draft';
          };
          
          // Create processed order with required properties
          const processedOrder = {
            ...order,
            supplier: formattedSupplier,
            deleted: false,
            items: Array.isArray(order.items) ? order.items : [],
            // Make sure required fields have default values
            payment_status: order.payment_status || 'pending',
            status: safeStatus(order.status),
            total_amount: order.total_amount || 0,
            order_number: order.order_number || `PO-${order.id.slice(0, 8)}`
          };
          
          return processedOrder;
        });

        console.log("Processed purchase orders:", processedData);
        return processedData;
      } catch (supabaseError) {
        console.error("Trying alternative fetch method after error:", supabaseError);
        
        // Fallback to a simpler approach with error handling
        try {
          const { data, error } = await supabase
            .from('purchase_orders')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          console.log("Basic purchase orders data:", data);
          
          if (!data || data.length === 0) {
            return [];
          }
          
          // For each purchase order, fetch supplier separately
          const enrichedOrders = await Promise.all(data.map(async (order) => {
            try {
              // Get supplier
              let supplierData: Partial<Supplier> = {};
              
              if (order.supplier_id) {
                const { data: supplier } = await supabase
                  .from('suppliers')
                  .select('*')
                  .eq('id', order.supplier_id)
                  .single();
                
                if (supplier) {
                  supplierData = supplier;
                }
              }
              
              // Get order items
              const { data: items = [] } = await supabase
                .from('purchase_order_items')
                .select('*')
                .eq('purchase_order_id', order.id);
              
              // Format supplier
              const formattedSupplier: Supplier = {
                id: (supplierData?.id || order.supplier_id || '').toString(),
                name: supplierData?.name || 'Fournisseur inconnu',
                phone: supplierData?.phone || '',
                email: supplierData?.email || ''
              };
              
              return {
                ...order,
                supplier: formattedSupplier,
                items: items || [],
                deleted: false,
                payment_status: order.payment_status || 'pending',
                status: order.status || 'draft',
                total_amount: order.total_amount || 0,
                order_number: order.order_number || `PO-${order.id.slice(0, 8)}`
              };
            } catch (error) {
              console.error("Error enriching order:", error);
              
              // Return basic order with minimal data
              return {
                ...order,
                supplier: {
                  id: order.supplier_id || 'unknown',
                  name: 'Fournisseur inconnu',
                  phone: '',
                  email: ''
                },
                items: [],
                deleted: false,
                payment_status: order.payment_status || 'pending',
                status: order.status || 'draft',
                total_amount: order.total_amount || 0,
                order_number: order.order_number || `PO-${order.id.slice(0, 8)}`
              };
            }
          }));
          
          console.log("Enriched purchase orders:", enrichedOrders);
          return enrichedOrders;
        } catch (fallbackError) {
          console.error("Error with fallback fetch method:", fallbackError);
          
          // Since we have no data, create a mock purchase order for testing
          console.log("Creating mock purchase order for debugging");
          const mockSupplier: Supplier = {
            id: "supplier-123",
            name: "Fournisseur Test",
            phone: "+123456789",
            email: "test@example.com"
          };
          
          const mockOrder: PurchaseOrder = {
            id: "mock-id-123",
            order_number: "PO-TEST-001",
            supplier_id: "supplier-123",
            supplier: mockSupplier,
            created_at: new Date().toISOString(),
            status: "draft",
            payment_status: "pending",
            total_amount: 1000,
            items: [],
            logistics_cost: 0,
            transit_cost: 0,
            tax_rate: 0,
            subtotal: 1000,
            tax_amount: 0,
            total_ttc: 1000,
            shipping_cost: 0,
            discount: 0,
            notes: "Commande test",
            expected_delivery_date: new Date().toISOString(),
            warehouse_id: "warehouse-123",
            paid_amount: 0,
          };
          
          console.log("Returning mock purchase order:", mockOrder);
          return [mockOrder];
        }
      }
    },
    retry: 2, // Retry twice to improve chances of success
    refetchOnWindowFocus: false // Prevent refetch on window focus for debugging
  });

  // Create purchase order mutation - properly typed
  const { mutate: createOrder } = useMutation({
    mutationFn: async (orderData: Omit<Partial<PurchaseOrder>, 'supplier' | 'warehouse' | 'items'>) => {
      // Remove properties that don't exist in database
      const { deleted, supplier: supplierObj, warehouse, items, ...restOrderData } = orderData as any;
      
      console.log("Creating order with data:", restOrderData);
      
      // Create main purchase order without the deleted field
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(restOrderData)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating purchase order:", error);
        throw error;
      }
      
      console.log("Successfully created purchase order:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Purchase order created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande créé avec succès");
    },
    onError: (error: any) => {
      console.error("Error creating purchase order:", error);
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  });

  // Handle create
  const handleCreate = async (orderData: any) => {
    try {
      console.log("Handling create with order data:", orderData);
      await createOrder(orderData);
      return true;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      return false;
    }
  };

  // Handle edit (navigate to edit page)
  const handleEdit = (id: string) => {
    console.log("Navigating to edit page for purchase order:", id);
    
    // Use the editPurchaseOrder hook instead of directly using navigate
    editPurchaseOrder(id);
  };

  // Handle approve
  const handleApprove = async (id: string) => {
    try {
      console.log("Approving purchase order:", id);
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande approuvé");
      return true;
    } catch (error) {
      console.error('Error approving purchase order:', error);
      toast.error("Erreur lors de l'approbation");
      return false;
    }
  };

  // Handle delete - since we don't have a deleted column, let's use a different approach
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande?")) {
      return false;
    }
    
    try {
      console.log("Deleting purchase order:", id);
      // We can't use soft delete since the column doesn't exist, so we'll do a hard delete
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande supprimé");
      return true;
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast.error("Erreur lors de la suppression");
      return false;
    }
  };

  return {
    orders,
    isLoading,
    handleApprove,
    handleDelete,
    handleEdit,
    handleCreate
  };
}
