
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PurchaseOrder } from "@/types/purchase-order";
import { TableActions } from "./table/TableActions";
import { OrderStatus } from "./table/OrderStatus";
import { DeleteConfirmationDialog } from "./table/dialogs/DeleteConfirmationDialog";
import { ApproveConfirmationDialog } from "./table/dialogs/ApproveConfirmationDialog";
import { LoadingState } from "./table/LoadingState";
import { EmptyState } from "./table/EmptyState";
import { supabase } from "@/integrations/supabase/client";

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
    if (!processingOrderId && localProcessing) {
      setLocalProcessing(false);
    }
  }, [processingOrderId, localProcessing]);
  
  const isAnyOperationInProgress = Boolean(processingOrderId) || localProcessing;

  const completeOperation = useCallback(() => {
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
    if (isAnyOperationInProgress) return;
    setSelectedOrderId(id);
    setShowApproveDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    if (isAnyOperationInProgress) return;
    setSelectedOrderId(id);
    setShowDeleteDialog(true);
  };

  const confirmApprove = async () => {
    if (!selectedOrderId || isAnyOperationInProgress) return;
    
    try {
      setLocalProcessing(true);
      await onApprove(selectedOrderId);
    } finally {
      completeOperation();
    }
  };

  const confirmDelete = async () => {
    if (!selectedOrderId || isAnyOperationInProgress) return;
    
    try {
      setLocalProcessing(true);
      await onDelete(selectedOrderId);
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
                <OrderStatus status={order.status} />
              </TableCell>
              <TableCell>{order.total_amount?.toLocaleString('fr-FR')} GNF</TableCell>
              <TableCell>
                <TableActions
                  order={order}
                  isAnyOperationInProgress={isAnyOperationInProgress}
                  processingOrderId={processingOrderId}
                  onApprove={handleApproveClick}
                  onDelete={handleDeleteClick}
                  onEdit={onEdit}
                  onPrint={onPrint}
                />
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
