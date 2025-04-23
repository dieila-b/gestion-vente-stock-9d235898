
import { useState } from "react";
import { formatDate } from "@/lib/formatters";
import { formatGNF } from "@/lib/currency";
import { PurchaseOrder } from "@/types/purchase-order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PurchaseOrderActions } from "./table/PurchaseOrderActions";
import { LoadingState } from "./table/LoadingState";
import { EmptyState } from "./table/EmptyState";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string) => Promise<void>;
  onPrint: (order: PurchaseOrder) => void;
}

export function PurchaseOrderTable({
  orders,
  isLoading,
  onApprove,
  onDelete,
  onEdit,
  onPrint
}: PurchaseOrderTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await onDelete(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await onEdit(id);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!orders || orders.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-md bg-background/95 border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Montant Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell>{order.supplier?.name || 'Non spécifié'}</TableCell>
              <TableCell>
                <StatusBadge
                  status={order.status}
                  statusMap={{
                    draft: { label: "Brouillon", variant: "outline" },
                    pending: { label: "En attente", variant: "warning" },
                    approved: { label: "Approuvé", variant: "success" },
                    delivered: { label: "Livré", variant: "info" }
                  }}
                />
              </TableCell>
              <TableCell>{formatGNF(order.total_amount)}</TableCell>
              <TableCell>
                <PurchaseOrderActions
                  order={order}
                  processingId={processingId}
                  onApprove={handleApprove}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPrint={onPrint}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
