
import { Button } from "@/components/ui/button";
import { Check, Trash2, Pencil, Printer } from "lucide-react";
import type { PurchaseOrder } from "@/types/purchase-order";

interface TableActionsProps {
  order: PurchaseOrder;
  isAnyOperationInProgress: boolean;
  processingOrderId: string | null;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPrint: (order: PurchaseOrder) => void;
}

export function TableActions({
  order,
  isAnyOperationInProgress,
  processingOrderId,
  onApprove,
  onDelete,
  onEdit,
  onPrint
}: TableActionsProps) {
  const isDisabled = isAnyOperationInProgress || processingOrderId === order.id;

  return (
    <div className="flex justify-end gap-2">
      {order.status !== 'approved' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => !isDisabled && onApprove(order.id)}
          disabled={isDisabled}
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">Approuver</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => !isDisabled && onEdit(order.id)}
        disabled={isDisabled}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Modifier</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => !isDisabled && onPrint(order)}
        disabled={isDisabled}
      >
        <Printer className="h-4 w-4" />
        <span className="sr-only">Imprimer</span>
      </Button>
      {order.status !== 'approved' && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          onClick={() => !isDisabled && onDelete(order.id)}
          disabled={isDisabled}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Supprimer</span>
        </Button>
      )}
    </div>
  );
}
