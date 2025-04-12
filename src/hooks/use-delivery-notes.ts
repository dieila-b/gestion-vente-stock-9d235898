
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DeliveryNote } from "@/types/delivery-note";

export function useDeliveryNotes() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch delivery notes
  const { data: deliveryNotes = [] } = useQuery({
    queryKey: ["delivery-notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delivery_notes")
        .select(`
          *,
          supplier:suppliers(*),
          purchase_order:purchase_orders(*),
          items:delivery_note_items(
            *,
            product:catalog(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DeliveryNote[];
    }
  });

  // Fetch warehouses for delivery destination
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    }
  });

  // Create delivery note
  const createDeliveryNote = useMutation({
    mutationFn: async (data: Partial<DeliveryNote>) => {
      const { data: newNote, error } = await supabase
        .from("delivery_notes")
        .insert([{ 
          ...data,
          status: "pending" 
        }])
        .select()
        .single();

      if (error) throw error;
      return newNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-notes"] });
      toast.success("Bon de livraison créé avec succès");
    }
  });

  // Update delivery note
  const updateDeliveryNote = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryNote> }) => {
      const { error } = await supabase
        .from("delivery_notes")
        .update(data)
        .eq("id", id);

      if (error) throw error;
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-notes"] });
      toast.success("Bon de livraison mis à jour avec succès");
    }
  });

  // Delete delivery note
  const deleteDeliveryNote = useMutation({
    mutationFn: async (id: string) => {
      // First delete associated items
      const { error: itemsError } = await supabase
        .from("delivery_note_items")
        .delete()
        .eq("delivery_note_id", id);

      if (itemsError) throw itemsError;

      // Then delete the note itself
      const { error } = await supabase
        .from("delivery_notes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-notes"] });
      toast.success("Bon de livraison supprimé avec succès");
    }
  });

  // Handle approve action
  const handleApprove = async (id: string) => {
    try {
      setIsLoading(true);
      await updateDeliveryNote.mutateAsync({ 
        id, 
        data: { status: "approved" } 
      });
      return true;
    } catch (error) {
      console.error("Error approving delivery note:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = async (id: string, data: any) => {
    try {
      setIsLoading(true);
      await updateDeliveryNote.mutateAsync({ id, data });
      return true;
    } catch (error) {
      console.error("Error updating delivery note:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete action
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteDeliveryNote.mutateAsync(id);
      return true;
    } catch (error) {
      console.error("Error deleting delivery note:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deliveryNotes,
    isLoading,
    warehouses,
    createDeliveryNote,
    updateDeliveryNote,
    deleteDeliveryNote,
    handleApprove,
    handleEdit,
    handleDelete
  };
}
