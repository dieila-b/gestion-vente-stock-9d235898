
import { useWarehousesQuery } from "./warehouses/use-warehouses-query";
import { useWarehousesMutations } from "./warehouses/use-warehouses-mutations";
import { useWarehouseDialog } from "./warehouses/use-warehouse-dialog";
import { Warehouse } from "@/types/warehouse";

export function useWarehouse() {
  const { warehouses, isLoading, isError } = useWarehousesQuery();
  const { 
    createWarehouse, 
    updateWarehouse, 
    deleteWarehouse, 
    isCreating, 
    isEditing 
  } = useWarehousesMutations();
  
  const { 
    selectedWarehouse, 
    setSelectedWarehouse, 
    isAddDialogOpen, 
    setIsAddDialogOpen,
    closeEditDialog
  } = useWarehouseDialog();

  // Handle form submission
  const handleSubmit = (data: Warehouse) => {
    console.log("Submitting warehouse data:", data);
    if (selectedWarehouse?.id) {
      updateWarehouse({
        ...data,
        id: selectedWarehouse.id
      });
      setIsAddDialogOpen(false);
    } else {
      createWarehouse(data);
      setIsAddDialogOpen(false);
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet entrepôt?")) {
      deleteWarehouse(id);
    }
  };

  return {
    warehouses,
    isLoading,
    isCreating,
    isEditing,
    editingWarehouse: selectedWarehouse ?? {} as Warehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    selectedWarehouse,
    setSelectedWarehouse,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleSubmit,
    handleDelete,
    closeEditDialog
  };
}
