
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";
import { StockMovement } from "@/hooks/stocks/useStockMovementTypes";
import { isSelectQueryError } from "@/utils/type-utils";

interface StockMovementsTableProps {
  movements: StockMovement[];
  isLoading: boolean;
  type: 'in' | 'out';
}

export function StockMovementsTable({ movements, isLoading, type }: StockMovementsTableProps) {
  // Helper function to safely get POS location name
  const getPosLocationName = (posLocation: StockMovement['pos_location']) => {
    if (!posLocation) return "-";
    if (isSelectQueryError(posLocation)) return "Erreur de chargement";
    return posLocation.name || "Sans nom";
  };

  // Helper function to determine location display with type
  const getLocationDisplay = (movement: StockMovement) => {
    // Vérifier d'abord si c'est un PDV basé sur le reason qui contient "(PDV: nom)"
    if (movement.reason && movement.reason.includes("(PDV:")) {
      const pdvMatch = movement.reason.match(/\(PDV: ([^)]+)\)/);
      if (pdvMatch) {
        return `${pdvMatch[1]} (PDV)`;
      }
    }
    
    // Sinon, afficher l'entrepôt
    if (movement.warehouse?.name) {
      return `${movement.warehouse.name} (Entrepôt)`;
    }
    
    return "Emplacement inconnu";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Emplacement</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">Prix unitaire</TableHead>
            <TableHead className="text-right">Valeur totale</TableHead>
            <TableHead>Motif</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10">
                Chargement des données...
              </TableCell>
            </TableRow>
          ) : movements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10">
                Aucune {type === 'in' ? 'entrée' : 'sortie'} trouvée
              </TableCell>
            </TableRow>
          ) : (
            movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {format(new Date(movement.created_at), 'Pp', { locale: fr })}
                </TableCell>
                <TableCell>{movement.product?.name || "Produit inconnu"}</TableCell>
                <TableCell>{movement.product?.reference || "-"}</TableCell>
                <TableCell>
                  {getLocationDisplay(movement)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {movement.type === 'in' ? (
                      <>
                        <ArrowUp className="w-4 h-4 text-green-500" />
                        <span>Entrée</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-4 h-4 text-red-500" />
                        <span>Sortie</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{movement.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatGNF(movement.unit_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatGNF(movement.total_value)}
                </TableCell>
                <TableCell>{movement.reason || "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
