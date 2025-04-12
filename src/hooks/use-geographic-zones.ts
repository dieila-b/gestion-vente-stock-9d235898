
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GeographicZone, ParentZone } from "@/types/geographic";
import { toast } from "sonner";

export function useGeographicZones() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<GeographicZone | null>(null);

  const { data: zones, refetch } = useQuery({
    queryKey: ["geographic-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geographic_zones")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erreur lors du chargement des zones géographiques");
        throw error;
      }

      return data as GeographicZone[];
    },
  });

  const { data: parentZones } = useQuery({
    queryKey: ["parent-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geographic_zones")
        .select("id, name, type")
        .in("type", ["region", "zone"])
        .order("name");

      if (error) throw error;
      return data as ParentZone[];
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const zoneData = {
      name: formData.get("name") as string,
      type: formData.get("type") as GeographicZone["type"],
      parent_id: formData.get("parent_id") as string || null,
      description: formData.get("description") as string || null,
    };

    try {
      if (selectedZone) {
        const { error } = await supabase
          .from("geographic_zones")
          .update(zoneData)
          .eq("id", selectedZone.id);

        if (error) throw error;
        toast.success("Zone géographique mise à jour avec succès");
      } else {
        const { error } = await supabase
          .from("geographic_zones")
          .insert([zoneData]);

        if (error) throw error;
        toast.success("Zone géographique ajoutée avec succès");
      }

      setIsAddDialogOpen(false);
      setSelectedZone(null);
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    }
  };

  const handleDelete = async (zone: GeographicZone) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette zone ?")) return;

    try {
      const { error } = await supabase
        .from("geographic_zones")
        .delete()
        .eq("id", zone.id);

      if (error) throw error;
      toast.success("Zone géographique supprimée avec succès");
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression");
      console.error(error);
    }
  };

  const getZoneTypeName = (type: GeographicZone["type"]) => {
    switch (type) {
      case "region":
        return "Région";
      case "zone":
        return "Zone";
      case "emplacement":
        return "Emplacement";
      default:
        return type;
    }
  };

  const getParentName = (parentId: string | undefined) => {
    if (!parentId || !parentZones) return "-";
    const parent = parentZones.find(zone => zone.id === parentId);
    return parent ? parent.name : "-";
  };

  return {
    zones,
    parentZones,
    selectedZone,
    setSelectedZone,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
    getZoneTypeName,
    getParentName
  };
}
