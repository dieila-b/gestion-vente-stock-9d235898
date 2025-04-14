
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function usePurchaseOrders() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query to fetch purchase orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*),
          warehouse:warehouses(*),
          items:purchase_order_items(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log("Fetched purchase orders:", data);
      return data || [];
    }
  });

  // Create purchase order mutation
  const { mutate: createOrder } = useMutation({
    mutationFn: async (orderData: any) => {
      // Create main purchase order
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(orderData)
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
    navigate(`/purchase-orders/edit/${id}`);
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

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande?")) {
      return false;
    }
    
    try {
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
