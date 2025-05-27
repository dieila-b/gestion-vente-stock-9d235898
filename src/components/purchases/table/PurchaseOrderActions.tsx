
import { Button } from "@/components/ui/button";
import { Printer, Check, Trash2, Pencil, Loader2 } from "lucide-react";
import { PurchaseOrder } from "@/types/purchase-order";
import { useState } from "react";
import { toast } from "sonner";

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
  const [localProcessing, setLocalProcessing] = useState<boolean>(false);
  const isProcessing = processingId === order.id || localProcessing;
  
  // Don't show approve button for already approved orders
  const canApprove = order.status !== 'approved';

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) {
      console.log("[PurchaseOrderActions] Already processing, ignoring click");
      return;
    }
    
    if (!order?.id) {
      console.error("[PurchaseOrderActions] No order ID available");
      toast.error("ID du bon de commande manquant");
      return;
    }
    
    if (order.status === 'approved') {
      toast.info("Ce bon de commande est déjà approuvé");
      return;
    }
    
    try {
      console.log(`[PurchaseOrderActions] Starting approval for order: ${order.id}, ${order.order_number}`);
      setLocalProcessing(true);
      
      await onApprove(order.id);
      console.log(`[PurchaseOrderActions] Approval completed for order: ${order.id}`);
      
    } catch (error: any) {
      console.error("[PurchaseOrderActions] Error in approve handler:", error);
      toast.error(`Erreur lors de l'approbation: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLocalProcessing(false);
    }
  };

  const handleEdit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) return;
    
    try {
      await onEdit(order.id);
    } catch (error: any) {
      console.error("[PurchaseOrderActions] Error in edit handler:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) return;
    
    try {
      await onDelete(order.id);
    } catch (error: any) {
      console.error("[PurchaseOrderActions] Error in delete handler:", error);
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      onPrint(order);
    } catch (error: any) {
      console.error("[PurchaseOrderActions] Error in print handler:", error);
      toast.error("Erreur lors de l'impression");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Bouton Modifier */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
        onClick={handleEdit}
        disabled={isProcessing}
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {/* Bouton Approuver (seulement si pas encore approuvé) */}
      {canApprove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 text-white"
          onClick={handleApprove}
          disabled={isProcessing}
          title={`Approuver le bon de commande ${order.order_number}`}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Bouton Supprimer (seulement si pas encore approuvé) */}
      {canApprove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white"
          onClick={handleDelete}
          disabled={isProcessing}
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}

      {/* Bouton Imprimer */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
        onClick={handlePrint}
        disabled={isProcessing}
        title="Imprimer"
      >
        <Printer className="h-4 w-4" />
      </Button>
    </div>
  );
}
