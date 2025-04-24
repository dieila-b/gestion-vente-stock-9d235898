
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Chargement...</TableCell>
            </TableRow>
          ) : orders?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Aucun bon de commande trouvé</TableCell>
            </TableRow>
          ) : (
            orders?.map((order) => (
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
                <TableCell>{order.total_amount.toLocaleString('fr-FR')} GNF</TableCell>
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
