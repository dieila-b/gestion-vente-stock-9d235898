
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { StockItemRow } from "./StockItemRow";
import { StockItemsTableLoading } from "./StockItemsTableLoading";
import { StockItemsTableEmpty } from "./StockItemsTableEmpty";

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
}

export function StockItemsTable({ items, isLoading, emptyMessage }: StockItemsTableProps) {
  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <Table>
        <TableHeader className="bg-black/40">
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead>Entrepôt</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">Prix Unitaire</TableHead>
            <TableHead className="text-right">Valeur Totale</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-black/20">
          {isLoading ? (
            <StockItemsTableLoading />
          ) : items.length === 0 ? (
            <StockItemsTableEmpty message={emptyMessage} />
          ) : (
            items.map((item) => <StockItemRow key={item.id} item={item} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
