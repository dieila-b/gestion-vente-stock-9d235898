
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { POSLocation } from "@/types/pos-locations";
import { toast } from "sonner";

export function usePOSLocationsMutations() {
  const queryClient = useQueryClient();

  // Create POS location
  const { mutate: createLocation, isPending: isCreating } = useMutation({
    mutationFn: async (locationData: Omit<POSLocation, "id">) => {
      try {
        console.log("Creating location with data:", locationData);
        
        // Ensure is_active is properly defined as boolean
        const dataToInsert = {
          ...locationData,
          is_active: typeof locationData.is_active === 'string' 
            ? locationData.is_active === 'true' 
            : Boolean(locationData.is_active),
          status: typeof locationData.is_active === 'string' 
            ? locationData.is_active === 'true' ? 'active' : 'inactive'
            : locationData.is_active ? 'active' : 'inactive'
        };

        const { data, error } = await supabase
          .from("pos_locations")
          .insert([dataToInsert])
          .select();
        
        if (error) {
          console.error("Supabase error creating location:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error("No data returned after insert");
        }
        
        return data[0];
      } catch (error) {
        console.error("Error creating location:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      toast.success("Entrepôt créé avec succès");
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
        // Ensure is_active is properly defined as boolean
        const dataToUpdate = {
          name: location.name,
          address: location.address,
          phone: location.phone,
          email: location.email,
          manager: location.manager,
          status: typeof location.is_active === 'string' 
            ? location.is_active === 'true' ? 'active' : 'inactive'
            : location.is_active ? 'active' : 'inactive',
          is_active: typeof location.is_active === 'string' 
            ? location.is_active === 'true' 
            : Boolean(location.is_active),
          capacity: location.capacity || 0,
          occupied: location.occupied || 0,
          surface: location.surface || 0
        };

        console.log("Updating location:", dataToUpdate);
        
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
      toast.success("Entrepôt mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Detailed error during update:", error);
      toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  // Delete POS location
  const { mutate: deleteLocation } = useMutation({
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
      toast.success("Entrepôt supprimé avec succès");
    },
    onError: (error) => {
      console.error("Detailed error during deletion:", error);
      toast.error(`Erreur lors de la suppression: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  return {
    createLocation,
    updateLocation,
    deleteLocation,
    isCreating,
    isEditing
  };
}
