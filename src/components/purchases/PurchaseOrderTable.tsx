
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Printer, Check, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PurchaseOrder } from "@/types/purchase-order";
import { LoadingState } from "./table/LoadingState";
import { EmptyState } from "./table/EmptyState";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  processingOrderId: string | null;
  onApprove: (orderId: string) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
  onEdit: (orderId: string) => Promise<void>;
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
  console.log("PurchaseOrderTable rendering with", orders?.length || 0, "orders");
  
  if (isLoading) {
    return <LoadingState />;
  }

  if (!orders || orders.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Nombre articles</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Montant net</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.order_number}</TableCell>
              <TableCell>
                {format(new Date(order.created_at), "dd/MM/yyyy", { locale: fr })}
              </TableCell>
              <TableCell>{order.supplier?.name || 'Fournisseur inconnu'}</TableCell>
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
              <TableCell>{(order.total_amount || 0).toLocaleString('fr-FR')} GNF</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {order.status !== 'approved' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(order.id)}
                        disabled={processingOrderId === order.id}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600"
                        onClick={() => onApprove(order.id)}
                        disabled={processingOrderId === order.id}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => onDelete(order.id)}
                        disabled={processingOrderId === order.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPrint(order)}
                    disabled={processingOrderId === order.id}
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
