
import { RecentMovementsList } from "./movements/RecentMovementsList";
import { MovementDetailsDialog } from "./movements/MovementDetailsDialog";
import { StockMovement, useRecentStockMovements } from "@/hooks/dashboard/useRecentStockMovements";
import { History } from "lucide-react";
import { useState } from "react";

export function RecentMovements() {
  const { data: movements = [], isLoading, error } = useRecentStockMovements();
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

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
      <RecentMovementsList 
        movements={movements} 
        onViewDetails={(movement) => setSelectedMovement(movement)}
      />
      
      <MovementDetailsDialog 
        isOpen={!!selectedMovement} 
        onClose={() => setSelectedMovement(null)} 
        movement={selectedMovement} 
      />
    </div>
  );
}
