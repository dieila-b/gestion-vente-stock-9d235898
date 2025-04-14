
import { Button } from "@/components/ui/button";
import { PurchaseOrder } from "@/types/purchaseOrder";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit, FileText, Trash, Printer } from "lucide-react";

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
  onPrint,
}: PurchaseOrderTableProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'draft':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'draft':
        return 'Brouillon';
      default:
        return status;
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Montant Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Chargement...
              </TableCell>
            </TableRow>
          ) : !orders?.length ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Aucun bon de commande trouvé
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.order_number}</TableCell>
                <TableCell>
                  {format(new Date(order.created_at), "dd/MM/yyyy", { locale: fr })}
                </TableCell>
                <TableCell>{order.supplier?.name}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </TableCell>
                <TableCell>{order.total_amount?.toLocaleString('fr-FR')} GNF</TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    {order.status !== 'approved' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => onApprove(order.id)}
                          title="Approuver"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          onClick={() => onEdit(order.id)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => onDelete(order.id)}
                          title="Supprimer"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={() => onPrint(order)}
                      title="Imprimer"
                    >
                      <Printer className="h-4 w-4" />
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
}
