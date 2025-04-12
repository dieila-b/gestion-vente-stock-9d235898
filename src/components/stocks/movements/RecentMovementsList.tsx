
import { Card } from "@/components/ui/card";
import { StockMovement } from "@/hooks/dashboard/useRecentStockMovements";
import { formatDateTime } from "@/lib/formatters";
import { MovementTypeIcon } from "./MovementTypeIcon";

interface RecentMovementsListProps {
  movements: StockMovement[];
}

export function RecentMovementsList({ movements }: RecentMovementsListProps) {
  return (
    <div className="space-y-3">
      {movements.map((movement) => (
        <Card key={movement.id} className="p-3 flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MovementTypeIcon type={movement.type} />
              <span className="font-medium">
                {movement.product?.name || "Unknown Product"}
              </span>
              {movement.product?.reference && (
                <span className="text-xs text-muted-foreground">
                  ({movement.product.reference})
                </span>
              )}
            </div>
            <span className="text-sm font-medium">
              {movement.type === "in" ? "+" : "-"}{movement.quantity}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground flex justify-between">
            <div>
              {movement.warehouse && (
                <span>{movement.warehouse.name}</span>
              )}
              {movement.pos_location && (
                <span> → {movement.pos_location.name}</span>
              )}
            </div>
            <span>{formatDateTime(movement.created_at)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
