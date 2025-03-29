
import { useState } from "react";
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { WarehouseTableHeader } from "./table/WarehouseTableHeader";
import { WarehouseEmptyState } from "./table/WarehouseEmptyState";
import { WarehouseRow } from "./table/WarehouseRow";
import { WarehouseDeleteDialog } from "./table/WarehouseDeleteDialog";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  surface: number;
  capacity: number;
  manager: string;
  status: string;
  occupied: number;
}

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit?: (warehouse: Warehouse) => void;
  onDelete?: (warehouse: Warehouse) => Promise<void>;
}

export function WarehouseTable({ warehouses, onEdit, onDelete }: WarehouseTableProps) {
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (warehouseToDelete && onDelete) {
      await onDelete(warehouseToDelete);
      setIsDeleteDialogOpen(false);
      setWarehouseToDelete(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <WarehouseTableHeader hasActions={!!(onEdit || onDelete)} />
        <TableBody>
          {warehouses.length === 0 ? (
            <WarehouseEmptyState colSpan={(onEdit || onDelete) ? 8 : 7} />
          ) : (
            warehouses.map((warehouse) => (
              <WarehouseRow 
                key={warehouse.id}
                warehouse={warehouse}
                onEdit={onEdit}
                onDelete={handleDeleteClick}
              />
            ))
          )}
        </TableBody>
      </Table>

      <WarehouseDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        warehouse={warehouseToDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
