
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PurchaseOrderActions } from "./PurchaseOrderActions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PurchaseOrder } from "@/types/purchase-order";
import { FileText, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  processingOrderId: string | null;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string) => Promise<void>;
  onPrint: (order: PurchaseOrder) => void;
  onCreateDeliveryNote?: (order: PurchaseOrder) => Promise<void>;
}

export function PurchaseOrderTable({
  orders,
  isLoading,
  processingOrderId,
  onApprove,
  onDelete,
  onEdit,
  onPrint,
  onCreateDeliveryNote
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
                {order.status === 'approved' && !order.delivery_note_created && onCreateDeliveryNote ? (
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="bg-[#1A1F2C] text-white hover:bg-[#222] hover:text-white px-3 py-1.5 rounded-md flex items-center"
                      disabled={processingOrderId === order.id}
                      onClick={() => onCreateDeliveryNote(order)}
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      <span>Bon de livraison</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <PurchaseOrderActions
                      order={order}
                      processingId={processingOrderId}
                      onApprove={onApprove}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onPrint={onPrint}
                    />
                  </div>
                )}
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
