import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DeliveryNote } from "@/types/delivery-note";
import { isSelectQueryError, safeSupplier } from "@/utils/supabase-safe-query";
import { useFetchDeliveryNotes } from "./delivery-notes/use-fetch-delivery-notes";
import { formatDate } from "@/lib/formatters";

export function useDeliveryNotes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query to fetch delivery notes using the updated hook
  const { data: deliveryNotes = [], isLoading } = useFetchDeliveryNotes();

  // Handle view
  const handleView = (id: string) => {
    navigate(`/delivery-notes/${id}`);
  };

  // Handle delete
  const { mutate: deleteDeliveryNote } = useMutation({
    mutationFn: async (id: string) => {
      // Instead of hard-deleting, just mark it as deleted
      const { error } = await supabase
        .from('delivery_notes')
        .update({ deleted: true })
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

  // Fonction pour créer manuellement un bon de livraison à partir d'une commande approuvée
  const createDeliveryNoteFromPO = async (purchaseOrderId: string) => {
    try {
      // Récupérer les détails de la commande
      const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .select(`
          id, 
          supplier_id, 
          order_number,
          items:purchase_order_items(*)
        `)
        .eq('id', purchaseOrderId)
        .single();
        
      if (orderError) {
        console.error("Error fetching purchase order:", orderError);
        toast.error("Erreur lors de la récupération de la commande");
        return false;
      }
      
      // Vérifier si un bon de livraison existe déjà
      const { data: existingNote, error: checkError } = await supabase
        .from('delivery_notes')
        .select('id')
        .eq('purchase_order_id', purchaseOrderId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking existing delivery note:", checkError);
        toast.error("Erreur lors de la vérification des bons de livraison existants");
        return false;
      }
      
      if (existingNote) {
        toast.info("Un bon de livraison existe déjà pour cette commande");
        return true;
      }
      
      // Créer le bon de livraison
      const deliveryNumber = `BL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const { data: newNote, error: createError } = await supabase
        .from('delivery_notes')
        .insert({
          purchase_order_id: order.id,
          supplier_id: order.supplier_id,
          delivery_number: deliveryNumber,
          status: 'pending',
          deleted: false,
          notes: `Bon de livraison créé manuellement depuis la commande ${order.order_number || ''}`
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating delivery note:", createError);
        toast.error("Erreur lors de la création du bon de livraison");
        return false;
      }
      
      // Créer les articles du bon de livraison
      if (order.items && order.items.length > 0 && newNote) {
        const itemsData = order.items.map((item: any) => ({
          delivery_note_id: newNote.id,
          product_id: item.product_id,
          quantity_ordered: item.quantity,
          quantity_received: 0,
          unit_price: item.unit_price
        }));
        
        const { error: itemsError } = await supabase
          .from('delivery_note_items')
          .insert(itemsData);
          
        if (itemsError) {
          console.error("Error creating delivery note items:", itemsError);
          toast.error("Erreur lors de la création des articles du bon de livraison");
          return false;
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success("Bon de livraison créé avec succès");
      return true;
    } catch (error: any) {
      console.error("Error in createDeliveryNoteFromPO:", error);
      toast.error(`Erreur: ${error.message}`);
      return false;
    }
  };

  return {
    deliveryNotes,
    isLoading,
    handleView,
    handleDelete,
    createDeliveryNoteFromPO
  };
}
