
import { useState } from "react";
import { Warehouse } from "@/types/warehouse";

export function useWarehouseDialog() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  return {
    selectedWarehouse,
    setSelectedWarehouse,
    isAddDialogOpen,
    setIsAddDialogOpen,
    closeEditDialog: () => setIsAddDialogOpen(false)
  };
}
