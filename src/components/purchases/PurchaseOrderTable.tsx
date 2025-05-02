
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PurchaseOrderActions } from "./PurchaseOrderActions";
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
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° BC</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number || order.id.substring(0, 8)}</TableCell>
              <TableCell>{format(new Date(order.created_at), "dd/MM/yyyy", { locale: fr })}</TableCell>
              <TableCell>{order.supplier?.name || 'N/A'}</TableCell>
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
              <TableCell className="text-right">{order.total_amount.toLocaleString('fr-FR')} GNF</TableCell>
              <TableCell className="text-right">
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
          ))}
          {orders.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                Aucun bon de commande trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
