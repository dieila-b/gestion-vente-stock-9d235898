
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Printer, Edit, Trash2, Loader } from "lucide-react";
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
                    onClick={() => onApprove(order.id)}
                    disabled={processingId === order.id}
                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500"
                  >
                    {processingId === order.id ? (
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
                  onClick={() => onEdit(order.id)}
                  disabled={processingId === order.id}
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
                  onClick={() => onDelete(order.id)}
                  disabled={processingId === order.id}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500"
                >
                  {processingId === order.id ? (
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
