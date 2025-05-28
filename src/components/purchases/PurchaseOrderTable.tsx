
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PurchaseOrder } from "@/types/purchase-order";
import { PurchaseOrderActions } from "./table/PurchaseOrderActions";

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
  const formatArticles = (items: any[]) => {
    if (!items || items.length === 0) return "0 article";
    
    const count = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    if (count === 1) {
      return `1 article (${totalQuantity} unités)`;
    }
    return `${count} articles (${totalQuantity} unités)`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Chargement...
              </TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Aucun bon de commande trouvé
              </TableCell>
            </TableRow>
          ) : (
            orders.map(order => (
              <TableRow key={order.id}>
                <TableCell>{order.order_number}</TableCell>
                <TableCell>
                  {format(new Date(order.created_at), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell>{order.supplier?.name || 'Non défini'}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatArticles(order.items || [])}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.status === 'approved' ? 'Approuvé' : 'En attente'}
                  </span>
                </TableCell>
                <TableCell>{order.total_amount?.toLocaleString('fr-FR')} GNF</TableCell>
                <TableCell>
                  <PurchaseOrderActions
                    order={order}
                    processingId={processingOrderId}
                    onApprove={onApprove}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPrint={onPrint}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
