
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { POSLocation } from "@/types/pos-locations";
import { transformPOSLocation } from "@/utils/data-transformers";

export const usePOSLocation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLocation, setEditingLocation] = useState<POSLocation | null>(null);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["pos-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_locations")
        .select("*")
        .order("name");

      if (error) throw error;
      
      if (data && Array.isArray(data)) {
        return data.map(item => transformPOSLocation(item));
      }
      
      return [];
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: async (formData: Omit<POSLocation, "id">) => {
      const { data, error } = await supabase
        .from("pos_locations")
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          status: formData.status,
          is_active: formData.is_active,
          manager: formData.manager,
          capacity: formData.capacity,
          occupied: formData.occupied,
          surface: formData.surface,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast({
        title: "Point de vente créé",
        description: "Le point de vente a été créé avec succès",
      });
      setIsCreating(false);
    },
    onError: (error) => {
      console.error("Error creating POS location:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer le point de vente",
      });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Omit<POSLocation, "id"> }) => {
      const { data, error } = await supabase
        .from("pos_locations")
        .update({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          status: formData.status,
          is_active: formData.is_active,
          manager: formData.manager,
          capacity: formData.capacity,
          occupied: formData.occupied,
          surface: formData.surface,
        })
        .eq("id", id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast({
        title: "Point de vente mis à jour",
        description: "Le point de vente a été mis à jour avec succès",
      });
      setIsEditing(false);
      setEditingLocation(null);
    },
    onError: (error) => {
      console.error("Error updating POS location:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le point de vente",
      });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pos_locations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast({
        title: "Point de vente supprimé",
        description: "Le point de vente a été supprimé avec succès",
      });
    },
    onError: (error) => {
      console.error("Error deleting POS location:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le point de vente",
      });
    },
  });

  const createLocation = async (formData: Omit<POSLocation, "id">) => {
    await createLocationMutation.mutateAsync(formData);
  };

  const updateLocation = async (id: string, formData: Omit<POSLocation, "id">) => {
    await updateLocationMutation.mutateAsync({ id, formData });
  };

  const deleteLocation = async (id: string) => {
    await deleteLocationMutation.mutateAsync(id);
  };

  const openCreateDialog = () => {
    setIsCreating(true);
  };

  const closeCreateDialog = () => {
    setIsCreating(false);
  };

  const openEditDialog = (location: POSLocation) => {
    setEditingLocation(location);
    setIsEditing(true);
  };

  const closeEditDialog = () => {
    setIsEditing(false);
    setEditingLocation(null);
  };

  return {
    locations,
    isLoading,
    isCreating,
    isEditing,
    editingLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
  };
};
