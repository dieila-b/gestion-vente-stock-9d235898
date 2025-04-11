
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTableQuery } from "./use-supabase-table-extension";
import { toast } from "sonner";

export type POSLocation = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  surface?: number;
  capacity?: number;
  occupied?: number;
  manager?: string;
  status?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export function usePOSLocation() {
  const queryClient = useQueryClient();
  const posLocationsQuery = createTableQuery('pos_locations');

  // Fetch all POS locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await posLocationsQuery
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as POSLocation[] || [];
    }
  });

  // Create a new POS location
  const createPOSLocation = useMutation({
    mutationFn: async (locationData: Omit<POSLocation, 'id'>) => {
      const { data, error } = await posLocationsQuery
        .insert(locationData)
        .select()
        .single();

      if (error) throw error;
      return data as POSLocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-locations'] });
      toast.success('Point de vente créé avec succès');
    },
    onError: (error: Error) => {
      console.error('Error creating POS location:', error);
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  });

  // Update a POS location
  const updatePOSLocation = useMutation({
    mutationFn: async ({ id, ...locationData }: POSLocation) => {
      const { data, error } = await posLocationsQuery
        .update(locationData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as POSLocation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-locations'] });
      toast.success('Point de vente mis à jour avec succès');
    },
    onError: (error: Error) => {
      console.error('Error updating POS location:', error);
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });

  // Delete a POS location
  const deletePOSLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await posLocationsQuery
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-locations'] });
      toast.success('Point de vente supprimé avec succès');
    },
    onError: (error: Error) => {
      console.error('Error deleting POS location:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  return {
    locations,
    isLoading,
    createPOSLocation,
    updatePOSLocation,
    deletePOSLocation
  };
}
