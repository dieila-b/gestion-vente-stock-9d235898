
import { usePOSLocationsQuery } from "./pos-locations/use-pos-locations-query";
import { usePOSLocationsMutations } from "./pos-locations/use-pos-locations-mutations";
import { usePOSLocationDialog } from "./pos-locations/use-pos-location-dialog";
import { POSLocation } from "@/types/pos-locations";

export function usePOSLocation() {
  const { locations, isLoading, isError } = usePOSLocationsQuery();
  const { 
    createLocation, 
    updateLocation, 
    deleteLocation, 
    isCreating, 
    isEditing 
  } = usePOSLocationsMutations();
  
  const { 
    selectedLocation, 
    setSelectedLocation, 
    isAddDialogOpen, 
    setIsAddDialogOpen,
    closeEditDialog
  } = usePOSLocationDialog();

  // Handle form submission
  const handleSubmit = (data: POSLocation) => {
    console.log("Submitting data:", data);
    if (selectedLocation?.id) {
      updateLocation({
        ...data,
        id: selectedLocation.id
      });
      setIsAddDialogOpen(false);
    } else {
      createLocation(data);
      setIsAddDialogOpen(false);
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet entrepôt?")) {
      deleteLocation(id);
    }
  };

  return {
    locations,
    isLoading,
    isCreating,
    isEditing,
    editingLocation: selectedLocation ?? {} as POSLocation,
    createLocation,
    updateLocation,
    deleteLocation,
    selectedLocation,
    setSelectedLocation,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
    closeEditDialog
  };
}
