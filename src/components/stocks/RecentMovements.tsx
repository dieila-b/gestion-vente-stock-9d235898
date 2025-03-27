import { formatDateTime } from "@/lib/formatters";
import { StockMovement, useRecentStockMovements } from "@/hooks/dashboard/useRecentStockMovements";
import { ArrowDownCircle, ArrowUpCircle, History, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function RecentMovements() {
  const { data: movements = [], isLoading, error } = useRecentStockMovements();
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-center">
        <History className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground mb-4">
          Une erreur s'est produite lors du chargement des mouvements de stock.
        </p>
        <pre className="text-xs text-left bg-muted p-4 rounded-md max-w-full overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-56">
        <p className="text-muted-foreground">Chargement des mouvements récents...</p>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56">
        <History className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Aucun mouvement récent</h3>
        <p className="text-center text-muted-foreground">
          Aucun mouvement de stock n'a été enregistré récemment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                  {movement.type === 'in' ? (
                    <>
                      <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      <span>Entrée</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownCircle className="h-4 w-4 text-amber-500" />
                      <span>Sortie</span>
                    </>
                  )}
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
                  onClick={() => setSelectedMovement(movement)}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Détails</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <MovementDetailsDialog 
        isOpen={!!selectedMovement} 
        onClose={() => setSelectedMovement(null)} 
        movement={selectedMovement} 
      />
    </div>
  );
}

interface MovementDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movement: StockMovement | null;
}

function MovementDetailsDialog({ isOpen, onClose, movement }: MovementDetailsDialogProps) {
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

  const getMovementTypeInfo = () => {
    return movement.type === 'in' 
      ? { label: "Entrée de stock", icon: <ArrowUpCircle className="h-5 w-5 text-green-500" /> }
      : { label: "Sortie de stock", icon: <ArrowDownCircle className="h-5 w-5 text-amber-500" /> };
  };

  const typeInfo = getMovementTypeInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeInfo.icon}
            <span>{typeInfo.label}</span>
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
