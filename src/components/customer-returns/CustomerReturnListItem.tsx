
import React, { useState } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { formatGNF } from '@/lib/currency';
import { CustomerReturn } from '@/types/customer-return';
import { Eye, RefreshCw, Trash2, PencilLine } from "lucide-react";
import { ReturnDetailsDialog } from "./ReturnDetailsDialog";
import { ReturnStatusDialog } from "./ReturnStatusDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomerReturnListItemProps {
  customerReturn: CustomerReturn;
  onRefresh: () => void;
}

const CustomerReturnListItem: React.FC<CustomerReturnListItemProps> = ({ customerReturn, onRefresh }) => {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'En attente';
    }
  };

  const handleStatusChange = async (newStatus: "pending" | "completed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from('customer_returns')
        .update({ status: newStatus })
        .eq('id', customerReturn.id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Le statut du retour a été changé en "${getStatusText(newStatus)}"`,
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error updating return status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du retour",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      // First delete associated items
      const { error: itemsError } = await supabase
        .from('customer_return_items')
        .delete()
        .eq('return_id', customerReturn.id);

      if (itemsError) throw itemsError;

      // Then delete the return itself
      const { error } = await supabase
        .from('customer_returns')
        .delete()
        .eq('id', customerReturn.id);

      if (error) throw error;

      toast({
        title: "Retour supprimé",
        description: "Le retour client a été supprimé avec succès",
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error deleting return:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le retour",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <TableRow className="hover:bg-black/5">
        <TableCell className="font-medium">{customerReturn.return_number}</TableCell>
        <TableCell>{formatDate(customerReturn.return_date)}</TableCell>
        <TableCell>{customerReturn.client?.company_name || "Client inconnu"}</TableCell>
        <TableCell>{customerReturn.invoice?.invoice_number || "Sans facture"}</TableCell>
        <TableCell>
          {customerReturn.returned_items?.length || 0} article(s)
        </TableCell>
        <TableCell className="max-w-xs truncate">
          {customerReturn.reason || "Sans motif"}
        </TableCell>
        <TableCell>{formatGNF(customerReturn.total_amount)}</TableCell>
        <TableCell>
          <Badge
            className={`${getStatusColor(customerReturn.status)} border px-2 py-1`}
            variant="outline"
            onClick={() => setIsStatusDialogOpen(true)}
          >
            {getStatusText(customerReturn.status)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailsDialogOpen(true)}
              title="Voir les détails"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <ReturnDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        customerReturn={customerReturn}
      />

      <ReturnStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onStatusChange={handleStatusChange}
        currentStatus={customerReturn.status}
      />
    </>
  );
};

export default CustomerReturnListItem;
