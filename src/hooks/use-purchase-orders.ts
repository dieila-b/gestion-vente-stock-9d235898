
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
        
        // Rather than trying to access order.deleted (which doesn't exist), 
        // set it to false for all orders since the column doesn't exist
        const processedData = data?.map(order => ({
          ...order,
          deleted: false
        })) || [];

        console.log("Fetched purchase orders:", processedData);
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
          
          // We set deleted to false for all orders since the column doesn't exist
          const processedData = ordersData?.map(order => ({
            ...order,
            deleted: false 
          })) || [];

          console.log("Fetched purchase orders with fallback method:", processedData);
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
      // Instead of destructuring deleted property (which doesn't exist in database),
      // we just create a new object without it
      const { deleted, ...restOrderData } = orderData;
      
      // Create main purchase order without the deleted field
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(restOrderData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande créé avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  });

  // Handle create
  const handleCreate = async (orderData: any) => {
    try {
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
