
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PurchaseOrder } from "@/types/purchase-order";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Pencil, Printer } from "lucide-react";
import { DeleteConfirmationDialog } from "./table/dialogs/DeleteConfirmationDialog";
import { ApproveConfirmationDialog } from "./table/dialogs/ApproveConfirmationDialog";
import { LoadingState } from "./table/LoadingState";
import { EmptyState } from "./table/EmptyState";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  processingOrderId: string | null;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string) => Promise<void>;
  onPrint: (order: PurchaseOrder) => void;
}

export function PurchaseOrderTable({
  orders,
  isLoading,
  processingOrderId,
  onApprove,
  onDelete,
  onEdit,
  onPrint
}: PurchaseOrderTableProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  
  useEffect(() => {
    console.log("PurchaseOrderTable state:", {
      showDeleteDialog,
      showApproveDialog,
      selectedOrderId,
      localProcessing,
      processingOrderId
    });
  }, [showDeleteDialog, showApproveDialog, selectedOrderId, localProcessing, processingOrderId]);
  
  // Reset internal state when external processing completes
  useEffect(() => {
    if (!processingOrderId && localProcessing) {
      console.log("External processing completed, resetting local state");
      setLocalProcessing(false);
    }
  }, [processingOrderId, localProcessing]);
  
  const isAnyOperationInProgress = Boolean(processingOrderId) || localProcessing;

  // Use a callback to handle operation completion
  const completeOperation = useCallback(() => {
    console.log("Operation completed, cleaning up state");
    setLocalProcessing(false);
    setSelectedOrderId(null);
    setShowDeleteDialog(false);
    setShowApproveDialog(false);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!orders || orders.length === 0) {
    return <EmptyState />;
  }

  const handleApproveClick = (id: string) => {
    if (isAnyOperationInProgress) {
      console.log("Operation already in progress, ignoring click");
      return;
    }
    console.log("Showing approve dialog for order:", id);
    setSelectedOrderId(id);
    setShowApproveDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    if (isAnyOperationInProgress) {
      console.log("Operation already in progress, ignoring click");
      return;
    }
    console.log("Showing delete dialog for order:", id);
    setSelectedOrderId(id);
    setShowDeleteDialog(true);
  };

  const confirmApprove = async () => {
    console.log("Confirming approval for order:", selectedOrderId);
    if (!selectedOrderId || isAnyOperationInProgress) {
      console.log("Cannot confirm approval - invalid state:", { 
        selectedOrderId, 
        isAnyOperationInProgress 
      });
      return;
    }
    
    try {
      setLocalProcessing(true);
      console.log("Starting approval process");
      const targetId = selectedOrderId;
      // Close the dialog first
      setShowApproveDialog(false);
      // Then perform the operation
      await onApprove(targetId);
      console.log("Approval completed");
    } catch (error) {
      console.error("Error in confirmApprove:", error);
    } finally {
      completeOperation();
    }
  };

  const confirmDelete = async () => {
    console.log("Confirming deletion for order:", selectedOrderId);
    if (!selectedOrderId || isAnyOperationInProgress) {
      console.log("Cannot confirm deletion - invalid state:", { 
        selectedOrderId, 
        isAnyOperationInProgress 
      });
      return;
    }
    
    try {
      setLocalProcessing(true);
      console.log("Starting deletion process");
      const targetId = selectedOrderId;
      // Close the dialog first
      setShowDeleteDialog(false);
      // Then perform the operation
      await onDelete(targetId);
      console.log("Deletion completed");
    } catch (error) {
      console.error("Error in confirmDelete:", error);
    } finally {
      completeOperation();
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.order_number}</TableCell>
              <TableCell>
                {format(new Date(order.created_at), "dd/MM/yyyy", { locale: fr })}
              </TableCell>
              <TableCell>{order.supplier?.name}</TableCell>
              <TableCell>{order.items?.length || 0}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'approved' ? 'bg-green-100 text-green-800' :
                  order.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status === 'approved' ? 'Approuvé' :
                   order.status === 'draft' ? 'Brouillon' :
                   'En attente'}
                </span>
              </TableCell>
              <TableCell>{order.total_amount?.toLocaleString('fr-FR')} GNF</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {order.status !== 'approved' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleApproveClick(order.id)}
                      disabled={isAnyOperationInProgress || processingOrderId === order.id}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Approuver</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      if (!isAnyOperationInProgress) {
                        onEdit(order.id);
                      }
                    }}
                    disabled={isAnyOperationInProgress || processingOrderId === order.id}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      if (!isAnyOperationInProgress) {
                        onPrint(order);
                      }
                    }}
                    disabled={isAnyOperationInProgress || processingOrderId === order.id}
                  >
                    <Printer className="h-4 w-4" />
                    <span className="sr-only">Imprimer</span>
                  </Button>
                  {order.status !== 'approved' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteClick(order.id)}
                      disabled={isAnyOperationInProgress || processingOrderId === order.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        isProcessing={localProcessing || Boolean(processingOrderId)}
        onOpenChange={(open) => {
          if (!localProcessing && !processingOrderId) {
            setShowDeleteDialog(open);
            if (!open) {
              setTimeout(() => setSelectedOrderId(null), 100);
            }
          }
        }}
        onConfirm={confirmDelete}
      />

      <ApproveConfirmationDialog
        isOpen={showApproveDialog}
        isProcessing={localProcessing || Boolean(processingOrderId)}
        onOpenChange={(open) => {
          if (!localProcessing && !processingOrderId) {
            setShowApproveDialog(open);
            if (!open) {
              setTimeout(() => setSelectedOrderId(null), 100);
            }
          }
        }}
        onConfirm={confirmApprove}
      />
    </>
  );
}
