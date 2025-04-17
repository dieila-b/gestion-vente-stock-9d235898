
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEditPurchaseOrder } from "./purchase-orders/mutations/use-edit-purchase-order";
import { db } from "@/utils/db-core";
import { PurchaseOrder } from "@/types/purchase-order";

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
          // Format the supplier information explicitly
          const supplierData = order.supplier || {};
          const formattedSupplier = {
            id: supplierData.id || order.supplier_id || '',
            name: supplierData.name || 'Fournisseur inconnu',
            phone: supplierData.phone || '',
            email: supplierData.email || ''
          };
          
          return {
            ...order,
            supplier: formattedSupplier,
            deleted: false
          };
        });

        console.log("Processed purchase orders:", processedData);
        return processedData;
      } catch (supabaseError) {
        console.error("Trying alternative fetch method after error:", supabaseError);
        
        // Fallback to db utility if the direct query fails
        try {
          const ordersData = await db.query(
            'purchase_orders',
            q => q.select(`
              *,
              supplier:suppliers (*),
              warehouse:warehouses (*),
              items:purchase_order_items (*)
            `)
            .order('created_at', { ascending: false }),
            []
          );
          
          console.log("Raw orders data from fallback:", ordersData);
          
          if (!ordersData || ordersData.length === 0) {
            console.log("No purchase orders found using fallback method");
            return [];
          }
          
          // Add deleted property and format supplier data
          const processedData = ordersData.map(order => {
            // Format the supplier information explicitly
            const supplierData = order.supplier || {};
            const formattedSupplier = {
              id: supplierData.id || order.supplier_id || '',
              name: supplierData.name || 'Fournisseur inconnu',
              phone: supplierData.phone || '',
              email: supplierData.email || ''
            };
            
            return {
              ...order,
              supplier: formattedSupplier,
              deleted: false
            };
          });

          console.log("Processed purchase orders with fallback method:", processedData);
          return processedData;
        } catch (fallbackError) {
          console.error("Error with fallback fetch method:", fallbackError);
          return [];
        }
      }
    }
  });

  // Create purchase order mutation - properly typed
  const { mutate: createOrder } = useMutation({
    mutationFn: async (orderData: Omit<Partial<PurchaseOrder>, 'supplier' | 'warehouse' | 'items'>) => {
      // Remove deleted property since it doesn't exist in database
      const { deleted, supplier, warehouse, items, ...restOrderData } = orderData as any;
      
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
