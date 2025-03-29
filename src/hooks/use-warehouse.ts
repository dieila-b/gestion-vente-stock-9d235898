
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  surface: number;
  capacity: number;
  manager: string;
  status: string;
  occupied: number;
  is_active?: boolean;
}

export function useWarehouse() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: warehouses, refetch } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouses")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erreur lors du chargement des entrepôts");
        throw error;
      }

      return (data as Warehouse[]).map(warehouse => ({
        ...warehouse,
        is_active: warehouse.is_active !== undefined ? warehouse.is_active : warehouse.status === 'Actif',
      }));
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const warehouseData = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      surface: Number(formData.get("surface")),
      capacity: Number(formData.get("capacity")),
      manager: formData.get("manager") as string,
      status: (formData.get("status") === "on" || formData.get("status") === "true") ? "Actif" : "Inactif",
      occupied: selectedWarehouse ? selectedWarehouse.occupied : 0,
    };

    try {
      if (selectedWarehouse) {
        const { error } = await supabase
          .from("warehouses")
          .update(warehouseData)
          .eq("id", selectedWarehouse.id);

        if (error) throw error;
        toast.success("Entrepôt mis à jour avec succès");
      } else {
        const { error } = await supabase
          .from("warehouses")
          .insert([warehouseData]);

        if (error) throw error;
        toast.success("Entrepôt ajouté avec succès");
      }

      setIsAddDialogOpen(false);
      setSelectedWarehouse(null);
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue");
      console.error(error);
    }
  };

  const handleDelete = async (warehouse: Warehouse) => {
    try {
      const { error } = await supabase
        .from("warehouses")
        .delete()
        .eq("id", warehouse.id);

      if (error) throw error;
      toast.success("Entrepôt supprimé avec succès");
      refetch();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression");
      console.error(error);
    }
  };

  return {
    warehouses,
    selectedWarehouse,
    setSelectedWarehouse,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
  };
}
