
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Pencil, Printer, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PurchaseOrder } from "@/types/purchase-order";

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
  if (isLoading) {
    return (
      <div className="text-center py-4">
        Chargement des bons de commande...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-4">
        Aucun bon de commande trouvé
      </div>
    );
  }

  return (
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
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(order.id)}
                      disabled={processingOrderId === order.id}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Éditer</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onApprove(order.id)}
                      disabled={processingOrderId === order.id}
                      className="flex items-center gap-2 text-green-600"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approuver</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(order.id)}
                      disabled={processingOrderId === order.id}
                      className="flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer</span>
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPrint(order)}
                  disabled={processingOrderId === order.id}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  <span>Imprimer</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
