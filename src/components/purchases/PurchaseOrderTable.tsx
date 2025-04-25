
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
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
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!orders || orders.length === 0) {
    return <EmptyState />;
  }

  const handleApproveClick = (id: string) => {
    if (!isProcessing) {
      setSelectedOrderId(id);
      setShowApproveDialog(true);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (!isProcessing) {
      setSelectedOrderId(id);
      setShowDeleteDialog(true);
    }
  };

  const confirmApprove = async () => {
    if (selectedOrderId && !isProcessing) {
      try {
        setIsProcessing(true);
        // Appel direct à la fonction d'approbation passée en prop
        await onApprove(selectedOrderId);
      } finally {
        setShowApproveDialog(false);
        setSelectedOrderId(null);
        setIsProcessing(false);
      }
    }
  };

  const confirmDelete = async () => {
    if (selectedOrderId && !isProcessing) {
      try {
        setIsProcessing(true);
        // Appel direct à la fonction de suppression passée en prop
        await onDelete(selectedOrderId);
      } finally {
        setShowDeleteDialog(false);
        setSelectedOrderId(null);
        setIsProcessing(false);
      }
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
                      disabled={processingOrderId === order.id || isProcessing}
                    >
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Approuver</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(order.id)}
                    disabled={processingOrderId === order.id || isProcessing}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onPrint(order)}
                    disabled={processingOrderId === order.id || isProcessing}
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
                      disabled={processingOrderId === order.id || isProcessing}
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
        isProcessing={isProcessing}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
      />

      <ApproveConfirmationDialog
        isOpen={showApproveDialog}
        isProcessing={isProcessing}
        onOpenChange={setShowApproveDialog}
        onConfirm={confirmApprove}
      />
    </>
  );
}
