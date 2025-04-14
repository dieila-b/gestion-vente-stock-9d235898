
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PurchaseOrder } from "@/types/purchaseOrder";

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
        .eq('status', 'draft')
        .or('status.eq.pending,status.eq.approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data to match PurchaseOrder type
      const processedOrders = (data || []).map((order) => {
        // Ensure proper supplier structure
        const supplierData = order.supplier || {};
        const supplier = {
          name: supplierData.name || 'Fournisseur non spécifié',
          phone: supplierData.phone || '',
          email: supplierData.email || ''
        };
        
        // Ensure items is always an array
        const items = order.items || [];
        
        return {
          ...order,
          supplier,
          items,
        };
      });
      
      return processedOrders;
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
    navigate(`/purchase-orders/edit/${id}`);
  };

  // Handle approve
  const { mutate: approveOrder } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande approuvé avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    }
  });

  const handleApprove = (id: string) => {
    approveOrder(id);
  };

  // Handle delete
  const { mutate: deleteOrder } = useMutation({
    mutationFn: async (id: string) => {
      // Instead of using the 'deleted' field, we'll use a different approach
      // and simply update the status to something like 'cancelled'
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const handleDelete = (id: string) => {
    deleteOrder(id);
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
