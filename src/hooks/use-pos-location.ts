
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { POSLocation } from "@/types/pos-locations";

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
      
      if (error) {
        console.error("Error fetching POS locations:", error);
        throw error;
      }
      return data as POSLocation[];
    }
  });

  // Create POS location
  const { mutate: createLocation, isPending: isCreating } = useMutation({
    mutationFn: async (locationData: Omit<POSLocation, "id">) => {
      try {
        // Fix: ensure is_active is properly set from the status switch
        const dataToInsert = {
          ...locationData,
          is_active: !!locationData.is_active
        };

        // Set status based on is_active
        if (dataToInsert.status === undefined) {
          dataToInsert.status = dataToInsert.is_active ? "active" : "inactive";
        }

        console.log("Creating POS location with data:", dataToInsert);
        
        const { data, error } = await supabase
          .from("pos_locations")
          .insert([dataToInsert])
          .select();
        
        if (error) {
          console.error("Supabase error creating location:", error);
          throw error;
        }
        
        return data[0];
      } catch (error) {
        console.error("Error creating location:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast.success("Point de vente créé avec succès");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      console.error("Detailed error during creation:", error);
      toast.error(`Erreur lors de la création: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  // Update POS location
  const { mutate: updateLocation, isPending: isEditing } = useMutation({
    mutationFn: async (location: POSLocation) => {
      try {
        // Ensure boolean value for is_active
        const dataToUpdate = {
          name: location.name,
          address: location.address,
          phone: location.phone,
          email: location.email,
          manager: location.manager,
          status: location.is_active ? "active" : "inactive",
          is_active: !!location.is_active,
          capacity: location.capacity || 0,
          occupied: location.occupied || 0,
          surface: location.surface || 0
        };

        console.log("Updating POS location:", dataToUpdate);
        
        const { data, error } = await supabase
          .from("pos_locations")
          .update(dataToUpdate)
          .eq("id", location.id)
          .select();
        
        if (error) {
          console.error("Supabase error updating location:", error);
          throw error;
        }
        
        return data[0];
      } catch (error) {
        console.error("Error updating location:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast.success("Point de vente mis à jour avec succès");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      console.error("Detailed error during update:", error);
      toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  // Delete POS location
  const { mutate: deleteLocationMutation } = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from("pos_locations")
          .delete()
          .eq("id", id);
        
        if (error) {
          console.error("Supabase error deleting location:", error);
          throw error;
        }
        
        return id;
      } catch (error) {
        console.error("Error deleting location:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast.success("Point de vente supprimé avec succès");
    },
    onError: (error) => {
      console.error("Detailed error during deletion:", error);
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
