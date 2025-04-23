
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Printer, Edit, Trash2, Loader } from "lucide-react";
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
  const [localLoading, setLocalLoading] = useState(false);
  
  const handleApproveClick = async () => {
    if (processingId === order.id || localLoading) return;
    
    setLocalLoading(true);
    try {
      console.log("PurchaseOrderActions: Approving order", order.id);
      await onApprove(order.id);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (processingId === order.id || localLoading) return;
    
    setLocalLoading(true);
    try {
      await onDelete(order.id);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEditClick = async () => {
    if (processingId === order.id || localLoading) return;
    
    setLocalLoading(true);
    try {
      await onEdit(order.id);
    } finally {
      setLocalLoading(false);
    }
  };

  const isProcessing = processingId === order.id || localLoading;

  return (
    <div className="flex items-center justify-end gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPrint(order)}
              className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-500"
              disabled={isProcessing}
            >
              <Printer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Imprimer</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {order.status !== 'approved' && order.status !== 'delivered' && (
        <>
          {order.status === 'pending' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleApproveClick}
                    disabled={isProcessing}
                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500"
                  >
                    {isProcessing ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Approuver</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditClick}
                  disabled={isProcessing}
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Modifier</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  disabled={isProcessing}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500"
                >
                  {isProcessing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supprimer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
