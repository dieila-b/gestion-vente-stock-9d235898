
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StockMovement } from "@/hooks/stocks/useStockMovementTypes";
import { formatDateTime } from "@/lib/formatters";
import { formatGNF } from "@/lib/currency";
import { Printer } from "lucide-react";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { isSelectQueryError } from "@/utils/type-utils";

interface StockMovementsPrintDialogProps {
  movements: StockMovement[];
  type: 'in' | 'out';
}

export function StockMovementsPrintDialog({ movements, type }: StockMovementsPrintDialogProps) {
  const [open, setOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: `${type === 'in' ? 'Entrées' : 'Sorties'} de Stock`,
    onAfterPrint: () => setOpen(false),
    printableElement: printRef.current,
  });

  // Helper function to safely get POS location name
  const getPosLocationName = (posLocation: StockMovement['pos_location']) => {
    if (!posLocation) return "-";
    if (isSelectQueryError(posLocation)) return "Erreur de chargement";
    return posLocation.name;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="enhanced-glass">
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {type === 'in' ? 'Entrées' : 'Sorties'} de Stock
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">
              {type === 'in' ? 'Entrées' : 'Sorties'} de Stock
            </h1>
            <p className="text-muted-foreground">
              Imprimé le {formatDateTime(new Date().toISOString())}
            </p>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Produit</th>
                <th className="border p-2 text-left">Référence</th>
                <th className="border p-2 text-left">Emplacement</th>
                <th className="border p-2 text-right">Quantité</th>
                <th className="border p-2 text-right">Prix unitaire</th>
                <th className="border p-2 text-right">Valeur totale</th>
                <th className="border p-2 text-left">Motif</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td className="border p-2">
                    {formatDateTime(movement.created_at)}
                  </td>
                  <td className="border p-2">{movement.product.name}</td>
                  <td className="border p-2">{movement.product.reference}</td>
                  <td className="border p-2">{movement.warehouse.name}</td>
                  <td className="border p-2 text-right">{movement.quantity}</td>
                  <td className="border p-2 text-right">
                    {formatGNF(movement.unit_price)}
                  </td>
                  <td className="border p-2 text-right">
                    {formatGNF(movement.total_value)}
                  </td>
                  <td className="border p-2">{movement.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
