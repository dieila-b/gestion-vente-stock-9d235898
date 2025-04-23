
import { formatDate } from "@/lib/formatters";
import { formatGNF } from "@/lib/currency";
import { PurchaseOrder } from "@/types/purchase-order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, Edit, Trash2, Box, Check, X, Loader } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
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
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleDelete = async (id: string) => {
    setProcessingId(id);
    try {
      await onDelete(id);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p>Chargement des bons de commande...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Alert>
        <Box className="h-5 w-5" />
        <AlertDescription>
          Aucun bon de commande trouvé. Créez votre premier bon de commande.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="border rounded-md">
      <Table className="whitespace-nowrap">
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Statut Paiement</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.supplier?.name || 'Non spécifié'}</div>
                  <div className="text-xs text-muted-foreground">{order.supplier?.contact || 'Contact non spécifié'}</div>
                </div>
              </TableCell>
              <TableCell>{formatGNF(order.total_amount)}</TableCell>
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
              <TableCell>
                <StatusBadge
                  status={order.payment_status}
                  statusMap={{
                    pending: { label: "En attente", variant: "warning" },
                    partial: { label: "Partiel", variant: "info" },
                    paid: { label: "Payé", variant: "success" }
                  }}
                />
              </TableCell>
              <TableCell className="text-right space-x-1">
                {/* Bouton Approuver, montré seulement si le statut est 'pending' */}
                {order.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleApprove(order.id)}
                    disabled={processingId === order.id}
                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500"
                    title="Approuver"
                  >
                    {processingId === order.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                {/* Bouton Modifier - désactivé si la commande est approuvée */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(order.id)}
                  disabled={order.status === 'approved'}
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
                  title="Modifier"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPrint(order)}
                  className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-500"
                  title="Imprimer"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                
                {/* Bouton Supprimer - désactivé si la commande est approuvée */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(order.id)}
                  disabled={order.status === 'approved' || processingId === order.id}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500"
                  title="Supprimer"
                >
                  {processingId === order.id ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
