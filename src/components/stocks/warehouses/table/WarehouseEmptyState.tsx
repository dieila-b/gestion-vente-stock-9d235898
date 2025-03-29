
import { TableRow, TableCell } from "@/components/ui/table";

interface WarehouseEmptyStateProps {
  colSpan: number;
}

export function WarehouseEmptyState({ colSpan }: WarehouseEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-10">
        Aucun entrepôt trouvé
      </TableCell>
    </TableRow>
  );
}
