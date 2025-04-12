
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StockMovement } from "@/hooks/dashboard/useRecentStockMovements";
import { formatDateTime } from "@/lib/formatters";
import { MovementTypeIcon } from "./MovementTypeIcon";

interface MovementDetailsDialogProps {
  movement: StockMovement | null;
  open: boolean;
  onClose: () => void;
}

export function MovementDetailsDialog({ movement, open, onClose }: MovementDetailsDialogProps) {
  if (!movement) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Movement Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MovementTypeIcon type={movement.type} />
              <span className="text-lg font-semibold">
                {movement.type === "in" ? "Stock Entry" : "Stock Exit"}
              </span>
            </div>
            <span className="text-lg font-bold">
              {movement.type === "in" ? "+" : "-"}{movement.quantity}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product:</span>
              <span className="font-medium">{movement.product?.name || "Unknown"}</span>
            </div>

            {movement.product?.reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference:</span>
                <span>{movement.product.reference}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Warehouse:</span>
              <span>{movement.warehouse?.name || "Unknown"}</span>
            </div>

            {movement.pos_location && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">POS Location:</span>
                <span>{movement.pos_location.name}</span>
              </div>
            )}

            {movement.reason && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason:</span>
                <span>{movement.reason}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{formatDateTime(movement.created_at)}</span>
            </div>

            {movement.created_by && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created by:</span>
                <span>{movement.created_by}</span>
              </div>
            )}
          </div>
        </div>

        <Button onClick={onClose} className="w-full mt-4">Close</Button>
      </DialogContent>
    </Dialog>
  );
}
