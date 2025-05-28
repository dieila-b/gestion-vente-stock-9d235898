
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeliveryNote } from "@/types/delivery-note";

interface QuantitiesTableProps {
  note: DeliveryNote;
  receivedQuantities: Record<string, number>;
  onQuantityChange: (itemId: string, value: string) => void;
}

export function QuantitiesTable({
  note,
  receivedQuantities,
  onQuantityChange
}: QuantitiesTableProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Quantités reçues par article</h3>
      <p className="text-sm text-gray-600">
        Saisissez les quantités réellement reçues pour chaque article. Ces quantités seront ajoutées au stock de l'emplacement sélectionné.
      </p>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Qté commandée</TableHead>
            <TableHead>Qté reçue</TableHead>
            <TableHead>Prix unitaire</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {note.items.map((item) => {
            const receivedQty = receivedQuantities[item.id] || 0;
            const total = receivedQty * item.unit_price;
            
            return (
              <TableRow key={item.id}>
                <TableCell>{item.product?.name}</TableCell>
                <TableCell>{item.product?.reference}</TableCell>
                <TableCell>{item.quantity_ordered}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max={item.quantity_ordered}
                    value={receivedQty}
                    onChange={(e) => onQuantityChange(item.id, e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>{item.unit_price.toLocaleString('fr-FR')} GNF</TableCell>
                <TableCell className="font-medium">{total.toLocaleString('fr-FR')} GNF</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
