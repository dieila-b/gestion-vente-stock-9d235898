
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
    
    if (isProcessing) return;
    
    try {
      console.log(`[PurchaseOrderActions] Starting approval for order: ${order.id}, ${order.order_number}`);
      setLocalProcessing(true);
      
      if (!order.warehouse_id) {
        toast.error("Impossible d'approuver: l'entrepôt n'est pas spécifié pour cette commande");
        return;
      }
      
      await onApprove(order.id);
      console.log(`[PurchaseOrderActions] Approval completed for order: ${order.id}`);
      
      // Afficher une confirmation visuelle claire
      toast.success(`Commande ${order.order_number} approuvée avec succès`);
    } catch (error: any) {
      console.error("[PurchaseOrderActions] Error in approve handler:", error);
      toast.error(`Erreur lors de l'approbation: ${error.message || "Erreur inconnue"}`);
    } finally {
      setLocalProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Bouton Modifier */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg border-gray-300 hover:bg-gray-50"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit(order.id);
        }}
        disabled={isProcessing}
        title="Modifier"
      >
        <Pencil className="h-4 w-4 text-gray-600" />
      </Button>

      {/* Bouton Approuver (seulement si pas encore approuvé) */}
      {canApprove && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-green-300 hover:bg-green-50"
          onClick={handleApprove}
          disabled={isProcessing}
          title="Approuver"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
          ) : (
            <Check className="h-4 w-4 text-green-600" />
          )}
        </Button>
      )}

      {/* Bouton Supprimer (seulement si pas encore approuvé) */}
      {canApprove && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-red-300 hover:bg-red-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(order.id);
          }}
          disabled={isProcessing}
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      )}

      {/* Bouton Imprimer */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg border-blue-300 hover:bg-blue-50"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPrint(order);
        }}
        disabled={isProcessing}
        title="Imprimer"
      >
        <Printer className="h-4 w-4 text-blue-600" />
      </Button>
    </div>
  );
}
