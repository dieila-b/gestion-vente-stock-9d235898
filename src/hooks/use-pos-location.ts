
import { useState } from "react";
import { createTableQuery } from "./use-supabase-table-extension";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isSelectQueryError } from "@/utils/supabase-helpers";
import { toast } from "sonner";
import { POSLocation } from "@/types/pos-locations";

export function usePOSLocation() {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<POSLocation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch POS locations
  const { data = [], isLoading } = useQuery({
    queryKey: ["pos-locations"],
    queryFn: async () => {
      const { data, error } = await createTableQuery("pos_locations")
        .select("*")
        .order("name");

      if (error) throw error;

      // Filter out any items that aren't POS locations (might be other table types due to type issues)
      return Array.isArray(data) 
        ? data.filter(item => 
            // Make sure it has the expected properties of a POSLocation
            item && 
            typeof item === 'object' && 
            'id' in item && 
            !isSelectQueryError(item)
          ).map(location => {
            return {
              id: location.id || '',
              name: location.name || '',
              phone: location.phone || '',
              email: location.email || '',
              address: location.address || '',
              status: location.status || 'active',
              is_active: location.is_active || true,
              manager: location.manager || '',
              capacity: location.capacity || 0,
              occupied: location.occupied || 0,
              surface: location.surface || 0
            } as POSLocation;
          })
        : [];
    },
  });

  // Create mutation
  const createPOSLocation = useMutation({
    mutationFn: async (newLocation: Omit<POSLocation, "id">) => {
      const { data, error } = await createTableQuery("pos_locations")
        .insert([newLocation])
        .select("*")
        .single();

      if (error) throw error;

      // Safely handle response data
      if (data && typeof data === 'object' && !isSelectQueryError(data)) {
        return {
          id: data.id || '',
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          status: data.status || 'active',
          is_active: data.is_active || true,
          manager: data.manager || '',
          capacity: data.capacity || 0,
          occupied: data.occupied || 0,
          surface: data.surface || 0
        } as POSLocation;
      }
      
      throw new Error("Invalid data returned from create operation");
    },
    onSuccess: () => {
      toast.success("Location added successfully");
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Error adding location: ${error.message}`);
    },
  });

  // Update mutation
  const updatePOSLocation = useMutation({
    mutationFn: async ({ id, ...updateData }: POSLocation) => {
      const { data, error } = await createTableQuery("pos_locations")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      // Safely handle response data
      if (data && typeof data === 'object' && !isSelectQueryError(data)) {
        return {
          id: data.id || '',
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          status: data.status || 'active',
          is_active: data.is_active || true,
          manager: data.manager || '',
          capacity: data.capacity || 0,
          occupied: data.occupied || 0,
          surface: data.surface || 0
        } as POSLocation;
      }
      
      throw new Error("Invalid data returned from update operation");
    },
    onSuccess: () => {
      toast.success("Location updated successfully");
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
    },
    onError: (error) => {
      toast.error(`Error updating location: ${error.message}`);
    },
  });

  // Delete mutation
  const deletePOSLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await createTableQuery("pos_locations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("Location deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["pos-locations"] });
    },
    onError: (error) => {
      toast.error(`Error deleting location: ${error.message}`);
    },
  });

  // Handlers
  const handleSubmit = async (formData: Omit<POSLocation, "id">) => {
    if (selectedLocation) {
      // Update existing location
      await updatePOSLocation.mutateAsync({
        ...formData,
        id: selectedLocation.id,
      });
    } else {
      // Create new location
      await createPOSLocation.mutateAsync(formData);
    }
    setSelectedLocation(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      await deletePOSLocation.mutateAsync(id);
    }
  };

  return {
    locations: data,
    isLoading,
    createPOSLocation,
    updatePOSLocation,
    deletePOSLocation,
    selectedLocation,
    setSelectedLocation,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["pos-locations"] }),
  };
}
