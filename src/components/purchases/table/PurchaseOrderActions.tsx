
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

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) return;
    
    if (!confirm("Êtes-vous sûr de vouloir approuver ce bon de commande ? Un bon de livraison sera automatiquement créé.")) {
      return;
    }
    
    console.log("Attempting to approve order:", order.id);
    try {
      await onApprove(order.id);
    } catch (error) {
      console.error("Error in approve handler:", error);
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
            onClick={() => onEdit(order.id)}
            disabled={isProcessing}
            className="cursor-pointer"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onPrint(order)}
            disabled={isProcessing}
            className="cursor-pointer"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </DropdownMenuItem>
          {canApprove && (
            <DropdownMenuItem 
              onClick={() => onDelete(order.id)}
              disabled={isProcessing}
              className="text-red-600 cursor-pointer"
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
