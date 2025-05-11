
import { Button } from "@/components/ui/button";
import { Check, Printer, Trash2, Pencil, FileText } from "lucide-react";
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
  const isApproved = order.status === 'approved';
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
    <div className="flex items-center gap-2 bg-[#1A1F2C] rounded-md p-1.5">
      {canApprove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-white hover:bg-[#222] hover:text-white"
          onClick={handleApprove}
          disabled={isProcessing}
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">Approuver</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 p-0 text-white hover:bg-[#222] hover:text-white"
        onClick={handleEdit}
        disabled={isProcessing}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Modifier</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 p-0 text-white hover:bg-[#222] hover:text-white"
        onClick={handlePrint}
        disabled={isProcessing}
      >
        <Printer className="h-4 w-4" />
        <span className="sr-only">Imprimer</span>
      </Button>
      {canApprove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-red-600 hover:bg-[#222] hover:text-red-500"
          onClick={handleDelete}
          disabled={isProcessing}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Supprimer</span>
        </Button>
      )}
      
      <ApproveConfirmationDialog 
        isOpen={showApproveDialog}
        isProcessing={isProcessing}
        onOpenChange={setShowApproveDialog}
        onConfirm={confirmApprove}
      />
    </div>
  );
}
