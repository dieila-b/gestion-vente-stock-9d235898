
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";
import { PurchaseOrderItem } from "@/types/purchase-order";

interface PurchaseInvoiceItemsProps {
  items: PurchaseOrderItem[];
}

export function PurchaseInvoiceItems({ items }: PurchaseInvoiceItemsProps) {
  if (!items || items.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">Aucun article dans cette facture</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Réf.</TableHead>
            <TableHead>Article</TableHead>
            <TableHead className="text-right">Prix unitaire</TableHead>
            <TableHead className="text-center">Quantité</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.product?.reference || "-"}
              </TableCell>
              <TableCell>{item.product?.name || "Article inconnu"}</TableCell>
              <TableCell className="text-right">{formatGNF(item.unit_price)}</TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-right">{formatGNF(item.total_price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
