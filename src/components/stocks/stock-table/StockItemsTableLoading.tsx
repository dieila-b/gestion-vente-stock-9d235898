
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";

export function StockItemsTableLoading() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-10">
        Chargement des données...
      </TableCell>
    </TableRow>
  );
}
