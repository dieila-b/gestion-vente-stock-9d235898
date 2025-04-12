
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface POSLocation {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  capacity?: number;
  occupied?: number;
  surface?: number;
}

export function usePOSLocation() {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<POSLocation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch all POS locations
  const { data: locations = [], isLoading, isError } = useQuery({
    queryKey: ["pos-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_locations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as POSLocation[];
    }
  });

  // Create POS location
  const { mutate: createLocation, isPending: isCreating } = useMutation({
    mutationFn: async (locationData: Omit<POSLocation, "id">) => {
      const { data, error } = await supabase
        .from("pos_locations")
        .insert([locationData])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast.success("Point de vente créé avec succès");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur lors de la création: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  // Update POS location
  const { mutate: updateLocation, isPending: isEditing } = useMutation({
    mutationFn: async (location: POSLocation) => {
      const { data, error } = await supabase
        .from("pos_locations")
        .update({
          name: location.name,
          address: location.address,
          phone: location.phone,
          email: location.email,
          manager: location.manager,
          status: location.status,
          is_active: location.is_active,
          capacity: location.capacity,
          occupied: location.occupied,
          surface: location.surface
        })
        .eq("id", location.id)
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast.success("Point de vente mis à jour avec succès");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  // Delete POS location
  const { mutate: deleteLocationMutation } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pos_locations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast.success("Point de vente supprimé avec succès");
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  // Handle form submission
  const handleSubmit = (data: POSLocation) => {
    if (selectedLocation?.id) {
      updateLocation({
        ...data,
        id: selectedLocation.id
      });
    } else {
      createLocation(data);
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce point de vente?")) {
      deleteLocationMutation(id);
    }
  };

  // Close dialog helper
  const closeEditDialog = () => {
    setIsAddDialogOpen(false);
  };

  return {
    locations,
    isLoading,
    isCreating,
    isEditing,
    editingLocation: selectedLocation ?? {} as POSLocation,
    createLocation,
    updateLocation,
    deleteLocationMutation,
    selectedLocation,
    setSelectedLocation,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
    closeEditDialog
  };
}
