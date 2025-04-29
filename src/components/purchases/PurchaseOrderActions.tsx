
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Printer, Check, Trash2, Pencil, Loader2 } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PurchaseOrder } from "@/types/purchase-order";
import { useState } from "react";
import { ApproveConfirmationDialog } from "./table/dialogs/ApproveConfirmationDialog";

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
  const canApprove = order.status !== 'approved';
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  
  const handleApprove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setShowApproveDialog(true);
    }
  };

  const confirmApprove = async () => {
    try {
      await onApprove(order.id);
    } catch (error) {
      console.error("Error during approval:", error);
    } finally {
      setShowApproveDialog(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      onEdit(order.id);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      onDelete(order.id);
    }
  };
  
  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      onPrint(order);
    }
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
              className="cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approuver
                </>
              )}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={handleEdit}
            disabled={isProcessing}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handlePrint}
            disabled={isProcessing}
            className="cursor-pointer"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </DropdownMenuItem>
          {canApprove && (
            <DropdownMenuItem 
              onClick={handleDelete}
              disabled={isProcessing}
              className="text-red-600 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ApproveConfirmationDialog 
        isOpen={showApproveDialog}
        isProcessing={isProcessing}
        onOpenChange={setShowApproveDialog}
        onConfirm={confirmApprove}
      />
    </div>
  );
}
