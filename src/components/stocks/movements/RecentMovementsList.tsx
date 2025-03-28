
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import { StockMovement } from "@/hooks/dashboard/useRecentStockMovements";
import { MovementTypeIcon } from "./MovementTypeIcon";

interface RecentMovementsListProps {
  movements: StockMovement[];
  onViewDetails: (movement: StockMovement) => void;
}

export function RecentMovementsList({ movements, onViewDetails }: RecentMovementsListProps) {
  const getLocationName = (movement: StockMovement) => {
    if (movement.type === 'in' && movement.warehouse) {
      return movement.warehouse.name;
    } else if (movement.type === 'out' && movement.pos_location) {
      return movement.pos_location.name;
    } else if (movement.warehouse) {
      return movement.warehouse.name;
    } else if (movement.pos_location) {
      return movement.pos_location.name;
    }
    return "N/A";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date/Heure</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Produit</TableHead>
          <TableHead>Référence</TableHead>
          <TableHead>Emplacement</TableHead>
          <TableHead className="text-right">Quantité</TableHead>
          <TableHead>Motif</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell>{formatDateTime(movement.created_at)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MovementTypeIcon type={movement.type} />
                <span>{movement.type === 'in' ? 'Entrée' : 'Sortie'}</span>
              </div>
            </TableCell>
            <TableCell>{movement.product?.name || "N/A"}</TableCell>
            <TableCell>{movement.product?.reference || "N/A"}</TableCell>
            <TableCell>{getLocationName(movement)}</TableCell>
            <TableCell className="text-right font-medium">
              {movement.quantity}
            </TableCell>
            <TableCell>{movement.reason || "Non spécifié"}</TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onViewDetails(movement)}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Détails</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
