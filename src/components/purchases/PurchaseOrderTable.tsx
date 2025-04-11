
import React from 'react';
import { PurchaseOrder } from '@/types/purchaseOrder';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
  orders,
  isLoading,
  onApprove,
  onDelete,
  onEdit,
  onView
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="text-center py-4">Aucun bon de commande trouvé</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bon de commande</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.order_number}</TableCell>
            <TableCell>{order.supplier?.name || 'Unknown'}</TableCell>
            <TableCell>{formatDate(order.created_at)}</TableCell>
            <TableCell>
              {new Intl.NumberFormat('fr-GN', {
                style: 'currency',
                currency: 'GNF',
                minimumFractionDigits: 0,
              }).format(order.total_amount || 0)}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(order.status)}>
                {order.status === 'pending' && 'En attente'}
                {order.status === 'approved' && 'Approuvé'}
                {order.status === 'delivered' && 'Livré'}
                {order.status === 'cancelled' && 'Annulé'}
                {order.status === 'draft' && 'Brouillon'}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="icon" onClick={() => onView(order.id)}>
                <Eye className="h-4 w-4" />
              </Button>
              {order.status === 'pending' && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(order.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onApprove(order.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => onDelete(order.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
