
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StockItem {
  id: string;
  product?: {
    reference?: string;
    name?: string;
    category?: string;
  };
  warehouse?: {
    name: string;
  };
  quantity: number;
  unit_price: number;
  total_value: number;
}

interface StockItemsTableProps {
  items: StockItem[];
  isLoading: boolean;
}

export function StockItemsTable({ items, isLoading }: StockItemsTableProps) {
  return (
    <div className="rounded-md border">
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
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                Chargement des données...
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10">
                Aucun article trouvé
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product?.reference}</TableCell>
                <TableCell>{item.product?.category}</TableCell>
                <TableCell className="font-medium">
                  {item.product?.name}
                </TableCell>
                <TableCell>{item.warehouse?.name}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {item.unit_price.toLocaleString('fr-FR')} GNF
                </TableCell>
                <TableCell className="text-right">
                  {item.total_value.toLocaleString('fr-FR')} GNF
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
