
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { PackageX } from "lucide-react";

interface StockItemsTableEmptyProps {
  message?: string;
}

export function StockItemsTableEmpty({ message = "Aucun article trouvé" }: StockItemsTableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-10">
        <div className="flex flex-col items-center justify-center gap-2">
          <PackageX className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
