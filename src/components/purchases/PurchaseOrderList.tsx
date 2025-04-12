
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatGNF } from "@/lib/currency";
import { Eye, Edit, Trash2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

// Define the PurchaseOrder type based on the data we're using
interface PurchaseOrder {
  id: string;
  order_number: string;
  created_at: string;
  expected_delivery_date: string;
  supplier: {
    id: string;
    name: string;
  };
  status: string;
  payment_status: string;
  total_amount: number;
  paid_amount: number;
  discount: number;
  warehouse: {
    id: string;
    name: string;
  };
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
  onEdit,
}: PurchaseOrderListProps) {
  // Function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case "canceled":
        return <Badge className="bg-red-500">Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Function to get payment status badge
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Payé</Badge>;
      case "partial":
        return <Badge className="bg-blue-500">Partiel</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Non payé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Entrepôt</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Paiement</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-muted-foreground">Aucun bon de commande trouvé</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Entrepôt</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell>{order.supplier?.name || "N/A"}</TableCell>
              <TableCell>{order.warehouse?.name || "N/A"}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
              <TableCell>{formatGNF(order.total_amount || 0)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link to={`/purchase-orders/${order.id}`}>
                    <Button size="icon" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onEdit(order.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {order.status === "pending" && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => onApprove(order.id)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onDelete(order.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
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
