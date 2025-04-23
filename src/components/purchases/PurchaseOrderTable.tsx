
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PurchaseOrder } from "@/types/purchase-order";
import { PurchaseOrderActions } from "./table/PurchaseOrderActions";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  processingOrderId: string | null; 
  onApprove: (orderId: string) => Promise<void>;
  onDelete: (orderId: string) => Promise<void>;
  onEdit: (orderId: string) => Promise<void>;
  onPrint: (order: PurchaseOrder) => void;
}

export const PurchaseOrderTable = ({
  orders,
  isLoading,
  processingOrderId,
  onApprove,
  onDelete,
  onEdit,
  onPrint
}: PurchaseOrderTableProps) => {
  console.log("PurchaseOrderTable rendering with", orders?.length || 0, "orders");
  
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
                <TableCell>{order.total_amount?.toLocaleString('fr-FR') || 0} GNF</TableCell>
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
};
