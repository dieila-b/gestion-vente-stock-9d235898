
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockItemsTableLoading } from "./StockItemsTableLoading";
import { StockItemsTableEmpty } from "./StockItemsTableEmpty";
import { StockItemRow } from "./StockItemRow";

interface StockItem {
  id: string;
  product?: {
    reference?: string;
    name?: string;
    category?: string;
  };
  warehouse?: {
    id?: string;
    name: string;
  };
  quantity: number;
  unit_price: number;
  total_value: number;
}

interface StockItemsTableProps {
  items: StockItem[];
  isLoading: boolean;
  emptyMessage?: string;
  className?: string;
}

export function StockItemsTable({ 
  items, 
  isLoading, 
  emptyMessage, 
  className 
}: StockItemsTableProps) {
  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Entrepôt</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">Prix unitaire</TableHead>
            <TableHead className="text-right">Valeur totale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <StockItemsTableLoading />
          ) : items.length === 0 ? (
            <StockItemsTableEmpty message={emptyMessage} />
          ) : (
            items.map((item) => (
              <StockItemRow key={item.id} item={item} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
