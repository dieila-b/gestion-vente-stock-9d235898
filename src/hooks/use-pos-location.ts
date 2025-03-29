
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { POSLocation } from "@/types/pos-locations";

export function usePOSLocation() {
  const [selectedLocation, setSelectedLocation] = useState<POSLocation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: locations, refetch } = useQuery({
    queryKey: ["pos-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_locations")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erreur lors du chargement des dépôts PDV");
        throw error;
      }

      // Add is_active property if it doesn't exist in the data
      return (data as POSLocation[]).map(loc => ({
        ...loc,
        is_active: loc.is_active !== undefined ? loc.is_active : loc.status === 'active',
        email: loc.email || null
      }));
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const locationData = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string || null,
      email: formData.get("email") as string || null,
      manager: formData.get("manager") as string || "",
      status: "Actif",  // Set default active status
      capacity: Number(formData.get("capacity")) || 0,
      surface: Number(formData.get("surface")) || 0,
      occupied: selectedLocation?.occupied || 0,
      is_active: true,
    };

    try {
      if (selectedLocation) {
        const { error } = await supabase
          .from("pos_locations")
          .update(locationData)
          .eq("id", selectedLocation.id);

        if (error) throw error;
        toast.success("Dépôt PDV mis à jour avec succès");
      } else {
        const { error } = await supabase
          .from("pos_locations")
          .insert([locationData]);

        if (error) throw error;
        toast.success("Dépôt PDV ajouté avec succès");
      }

      setIsAddDialogOpen(false);
      setSelectedLocation(null);
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    }
  };

  const handleDelete = async (location: POSLocation) => {
    try {
      const { error } = await supabase
        .from("pos_locations")
        .delete()
        .eq("id", location.id);

      if (error) throw error;
      toast.success("Dépôt PDV supprimé avec succès");
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression");
      console.error(error);
    }
  };

  return {
    locations,
    selectedLocation,
    setSelectedLocation,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
    refetch,  // Export refetch function
  };
}
