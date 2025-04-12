
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckSquare, Eye } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PurchaseOrder {
  id: string;
  supplier: {
    name: string;
  };
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
}

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function PurchaseOrderList({
  orders,
  isLoading,
  onApprove,
  onDelete,
  onEdit
}: PurchaseOrderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun bon de commande trouvé
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approuvé</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Livré</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N° Commande</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.order_number}</TableCell>
            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
            <TableCell>{order.supplier.name}</TableCell>
            <TableCell>{getStatusBadge(order.status)}</TableCell>
            <TableCell>{formatGNF(order.total_amount)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(order.id)}
                  title="Voir/Modifier"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {order.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onApprove(order.id)}
                      title="Approuver"
                    >
                      <CheckSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(order.id)}
                      title="Supprimer"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
