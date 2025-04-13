
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Warehouse } from "@/types/warehouse";
import { toast } from "sonner";

export function useWarehousesMutations() {
  const queryClient = useQueryClient();

  // Create warehouse
  const { mutate: createWarehouse, isPending: isCreating } = useMutation({
    mutationFn: async (warehouseData: Omit<Warehouse, "id" | "created_at" | "updated_at">) => {
      try {
        console.log("Creating warehouse with data:", warehouseData);
        
        // Ensure is_active is properly defined as boolean
        const dataToInsert = {
          ...warehouseData,
          is_active: typeof warehouseData.is_active === 'string' 
            ? warehouseData.is_active === 'true' 
            : Boolean(warehouseData.is_active),
          status: typeof warehouseData.is_active === 'string' 
            ? warehouseData.is_active === 'true' ? 'Actif' : 'Inactif'
            : warehouseData.is_active ? 'Actif' : 'Inactif'
        };

        const { data, error } = await supabase
          .from("warehouses")
          .insert([dataToInsert])
          .select();
        
        if (error) {
          console.error("Supabase error creating warehouse:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error("No data returned after insert");
        }
        
        return data[0];
      } catch (error) {
        console.error("Error creating warehouse:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Entrepôt créé avec succès");
    },
    onError: (error) => {
      console.error("Detailed error during creation:", error);
      toast.error(`Erreur lors de la création: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  // Update warehouse
  const { mutate: updateWarehouse, isPending: isEditing } = useMutation({
    mutationFn: async (warehouse: Warehouse) => {
      try {
        // Ensure is_active is properly defined as boolean
        const dataToUpdate = {
          name: warehouse.name,
          address: warehouse.address,
          location: warehouse.location,
          manager: warehouse.manager,
          status: typeof warehouse.is_active === 'string' 
            ? warehouse.is_active === 'true' ? 'Actif' : 'Inactif'
            : warehouse.is_active ? 'Actif' : 'Inactif',
          is_active: typeof warehouse.is_active === 'string' 
            ? warehouse.is_active === 'true' 
            : Boolean(warehouse.is_active),
          capacity: warehouse.capacity || 0,
          occupied: warehouse.occupied || 0,
          surface: warehouse.surface || 0
        };

        console.log("Updating warehouse:", dataToUpdate);
        
        const { data, error } = await supabase
          .from("warehouses")
          .update(dataToUpdate)
          .eq("id", warehouse.id)
          .select();
        
        if (error) {
          console.error("Supabase error updating warehouse:", error);
          throw error;
        }
        
        return data[0];
      } catch (error) {
        console.error("Error updating warehouse:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Entrepôt mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Detailed error during update:", error);
      toast.error(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  // Delete warehouse
  const { mutate: deleteWarehouse } = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from("warehouses")
          .delete()
          .eq("id", id);
        
        if (error) {
          console.error("Supabase error deleting warehouse:", error);
          throw error;
        }
        
        return id;
      } catch (error) {
        console.error("Error deleting warehouse:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Entrepôt supprimé avec succès");
    },
    onError: (error) => {
      console.error("Detailed error during deletion:", error);
      toast.error(`Erreur lors de la suppression: ${error instanceof Error ? error.message : "erreur inconnue"}`);
    }
  });

  return {
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    isCreating,
    isEditing
  };
}
