
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Printer, Check, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PurchaseOrder } from "@/types/purchaseOrder";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onView?: (orderId: string) => void;
  onPrint?: (order: PurchaseOrder) => void;
}

export const PurchaseOrderTable = ({
  orders,
  isLoading,
  onApprove,
  onDelete,
  onEdit,
  onView,
  onPrint
}: PurchaseOrderTableProps) => {
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
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell>{order.supplier.name}</TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === 'approved' ? "outline" :
                      order.status === 'draft' ? "outline" :
                      "outline"
                    }
                    className={
                      order.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                      order.status === 'draft' ? 'bg-gray-100 text-gray-800 hover:bg-gray-100' :
                      'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                    }
                  >
                    {order.status === 'approved' ? 'Approuvé' :
                     order.status === 'draft' ? 'Brouillon' :
                     order.status === 'pending' ? 'En attente' :
                     'Livré'}
                  </Badge>
                </TableCell>
                <TableCell>{order.total_amount.toLocaleString('fr-FR')} GNF</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {order.status !== 'approved' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(order.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => onApprove(order.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => onDelete(order.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(order.id)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    )}
                    {onPrint && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPrint(order)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    )}
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
