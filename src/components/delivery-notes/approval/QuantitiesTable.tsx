
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
  console.log("QuantitiesTable - note:", note);
  console.log("QuantitiesTable - items:", note.items);
  console.log("QuantitiesTable - items count:", note.items?.length || 0);

  if (!note.items || !Array.isArray(note.items) || note.items.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Quantités reçues par article</h3>
        <div className="p-4 text-center text-gray-500 border rounded-md">
          Aucun article trouvé dans ce bon de livraison.
          <br />
          <span className="text-sm">
            Bon de livraison ID: {note.id} | Items: {note.items?.length || 0}
          </span>
          <br />
          <span className="text-xs text-red-500">
            Vérifiez que le bon de livraison a été créé correctement à partir d'une commande d'achat approuvée.
          </span>
        </div>
      </div>
    );
  }

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
            const total = receivedQty * (item.unit_price || 0);
            
            console.log("Rendering item:", item);
            
            return (
              <TableRow key={item.id}>
                <TableCell>{item.product?.name || 'Produit inconnu'}</TableCell>
                <TableCell>{item.product?.reference || 'N/A'}</TableCell>
                <TableCell>{item.quantity_ordered || 0}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max={item.quantity_ordered || 0}
                    value={receivedQty}
                    onChange={(e) => onQuantityChange(item.id, e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>{(item.unit_price || 0).toLocaleString('fr-FR')} GNF</TableCell>
                <TableCell className="font-medium">{total.toLocaleString('fr-FR')} GNF</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
