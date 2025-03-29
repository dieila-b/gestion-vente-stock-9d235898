
import { TableRow, TableCell } from "@/components/ui/table";

interface POSLocationsEmptyStateProps {
  colSpan: number;
}

export function POSLocationsEmptyState({ colSpan }: POSLocationsEmptyStateProps) {
  return (
    <TableRow className="border-b border-[#333]">
      <TableCell colSpan={colSpan} className="text-center py-10 text-gray-400">
        Aucun PDV trouvé
      </TableCell>
    </TableRow>
  );
}
