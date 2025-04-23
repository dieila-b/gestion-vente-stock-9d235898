
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Printer, Check, Trash2, Pencil } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PurchaseOrder } from "@/types/purchase-order";

interface PurchaseOrderActionsProps {
  order: PurchaseOrder;
  processingId: string | null;
  onApprove: (id: string) => Promise<void>;
  onEdit: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onPrint: (order: PurchaseOrder) => void;
}

export function PurchaseOrderActions({
  order,
  processingId,
  onApprove,
  onEdit,
  onDelete,
  onPrint
}: PurchaseOrderActionsProps) {
  const isProcessing = processingId === order.id;
  
  // Don't show approve button for already approved orders
  const canApprove = order.status !== 'approved';

  const handleApprove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApprove(order.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(order.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(order.id);
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPrint(order);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canApprove && (
            <DropdownMenuItem 
              onClick={handleApprove}
              disabled={isProcessing}
            >
              <Check className="mr-2 h-4 w-4" />
              {isProcessing ? "Traitement..." : "Approuver"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={handleEdit}
            disabled={isProcessing}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handlePrint}
            disabled={isProcessing}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </DropdownMenuItem>
          {canApprove && (
            <DropdownMenuItem 
              onClick={handleDelete}
              disabled={isProcessing}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
