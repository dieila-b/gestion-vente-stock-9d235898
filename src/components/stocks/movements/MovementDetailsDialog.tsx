
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/formatters";
import { StockMovement } from "@/hooks/dashboard/useRecentStockMovements";
import { MovementTypeIcon } from "./MovementTypeIcon";

interface MovementDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movement: StockMovement | null;
}

export function MovementDetailsDialog({ isOpen, onClose, movement }: MovementDetailsDialogProps) {
  if (!movement) return null;

  const getLocationInfo = () => {
    if (movement.type === 'in' && movement.warehouse) {
      return `Entrepôt: ${movement.warehouse.name}`;
    } else if (movement.type === 'out' && movement.pos_location) {
      return `Point de vente: ${movement.pos_location.name}`;
    } else if (movement.warehouse) {
      return `Entrepôt: ${movement.warehouse.name}`;
    } else if (movement.pos_location) {
      return `Point de vente: ${movement.pos_location.name}`;
    }
    return "Emplacement non spécifié";
  };

  const typeLabel = movement.type === 'in' ? "Entrée de stock" : "Sortie de stock";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MovementTypeIcon type={movement.type} size={5} />
            <span>{typeLabel}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Produit</h4>
              <p className="font-medium">{movement.product.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Référence</h4>
              <p>{movement.product.reference || "N/A"}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Emplacement</h4>
            <p>{getLocationInfo()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Quantité</h4>
              <p className="font-medium">{movement.quantity}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Date/Heure</h4>
              <p>{formatDateTime(movement.created_at)}</p>
            </div>
          </div>

          {movement.created_by && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Créé par</h4>
              <p>{movement.created_by.name}</p>
            </div>
          )}

          {movement.reason && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Motif</h4>
              <p>{movement.reason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
