
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { PurchaseOrder } from "@/types/purchaseOrder";
import { 
  CheckCircle, 
  Pencil, 
  Eye, 
  Trash2,
  Printer
} from "lucide-react";

export interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView?: (id: string) => void;
  onPrint?: (order: PurchaseOrder) => void;
}

export const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
  orders,
  isLoading,
  onApprove,
  onDelete,
  onEdit,
  onView,
  onPrint
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Livré</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approuvé</Badge>;
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Non payé</Badge>;
      case "partial":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Partiellement payé</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Payé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Aucun bon de commande trouvé
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{order.supplier?.name || "Inconnu"}</TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GNF' }).format(order.total_amount)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {order.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onApprove(order.id)}
                        title="Approuver"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {(order.status === "pending" || order.status === "draft") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(order.id)}
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(order.id)}
                        title="Voir"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onPrint && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrint(order)}
                        title="Imprimer"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(order.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
