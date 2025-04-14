
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DeliveryNote } from "@/types/delivery-note";
import { isSelectQueryError, safeSupplier } from "@/utils/type-utils";

export function useDeliveryNotes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query to fetch delivery notes
  const { data: rawDeliveryNotes = [], isLoading } = useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          supplier:suppliers(*),
          purchase_order:purchase_orders(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Process delivery notes to ensure they match the DeliveryNote type
  const deliveryNotes: DeliveryNote[] = rawDeliveryNotes.map(note => {
    // Handle supplier safely
    const supplier = isSelectQueryError(note.supplier)
      ? { name: 'Fournisseur inconnu', phone: '', email: '' }
      : note.supplier || { name: 'Fournisseur non spécifié', phone: '', email: '' };
    
    // Handle purchase order safely
    const purchaseOrder = isSelectQueryError(note.purchase_order)
      ? { order_number: '', total_amount: 0 }
      : note.purchase_order || { order_number: '', total_amount: 0 };

    // Return a complete DeliveryNote object with all required fields
    return {
      id: note.id || '',
      delivery_number: note.delivery_number || '',
      created_at: note.created_at || new Date().toISOString(),
      updated_at: note.updated_at || new Date().toISOString(),
      notes: note.notes || '',
      status: (note as any).status || 'pending', // Type cast and provide default
      supplier_id: (note as any).supplier_id || '', // Type cast and provide default
      purchase_order_id: (note as any).purchase_order_id || '', // Type cast and provide default
      supplier,
      purchase_order: purchaseOrder,
      items: [] // We'll need to fetch items separately or ensure they're included in the initial query
    };
  });

  // Handle view
  const handleView = (id: string) => {
    navigate(`/delivery-notes/${id}`);
  };

  // Handle delete
  const { mutate: deleteDeliveryNote } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('delivery_notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success("Bon de livraison supprimé");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce bon de livraison?")) {
      deleteDeliveryNote(id);
    }
  };

  return {
    deliveryNotes,
    isLoading,
    handleView,
    handleDelete
  };
}
