
import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  FileCheck, 
  ArrowLeftRight,
  Package
} from "lucide-react";
import { CustomerReturn, ReturnedItem } from "@/types/customer-return";
import { formatDate } from "@/lib/formatters";
import { formatGNF } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { ReturnDetailsDialog } from "./ReturnDetailsDialog";
import { ReturnStatusDialog } from "./ReturnStatusDialog";

interface CustomerReturnItemProps {
  customerReturn: CustomerReturn;
  onRefresh: () => void;
}

export function CustomerReturnItem({ customerReturn, onRefresh }: CustomerReturnItemProps) {
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

  const handleApproveReturn = async () => {
    try {
      const { error } = await supabase
        .from('customer_returns')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', customerReturn.id);
      
      if (error) throw error;
      
      toast({
        title: "Retour approuvé",
        description: "Le retour client a été approuvé avec succès"
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error approving return:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le retour client",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <TableRow 
        key={customerReturn.id} 
        className="border-b border-purple-500/10 hover:bg-white/5 transition-colors"
      >
        <TableCell className="font-medium text-indigo-100">{customerReturn.return_number}</TableCell>
        <TableCell>{formatDate(customerReturn.return_date)}</TableCell>
        <TableCell>{customerReturn.client?.company_name || 'Client inconnu'}</TableCell>
        <TableCell>{customerReturn.invoice?.invoice_number || 'N/A'}</TableCell>
        <TableCell>
          {customerReturn.returned_items && customerReturn.returned_items.length > 0 ? (
            <div className="flex flex-col gap-1">
              {customerReturn.returned_items.slice(0, 2).map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-sm">
                  <Package className="h-3 w-3 text-indigo-300" />
                  <span className="text-indigo-100">{item.quantity}x</span>
                  <span className="truncate max-w-[120px]" title={item.product_name}>{item.product_name}</span>
                </div>
              ))}
              {customerReturn.returned_items.length > 2 && (
                <div className="text-xs text-indigo-300 italic">
                  +{customerReturn.returned_items.length - 2} autres articles
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Aucun article</span>
          )}
        </TableCell>
        <TableCell className="max-w-xs">
          <div className="truncate" title={customerReturn.reason || 'N/A'}>
            {customerReturn.reason || 'N/A'}
          </div>
        </TableCell>
        <TableCell className="font-medium">{formatGNF(customerReturn.total_amount)}</TableCell>
        <TableCell>
          <Badge
            className={`${getStatusColor(customerReturn.status)} border px-3 py-1`}
            variant="outline"
          >
            {getStatusText(customerReturn.status)}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20"
              onClick={() => setIsDetailsDialogOpen(true)}
            >
              <FileText className="h-4 w-4" />
              <span className="sr-only">Voir les détails</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
              onClick={handleApproveReturn}
              disabled={customerReturn.status !== 'pending'}
            >
              <FileCheck className="h-4 w-4" />
              <span className="sr-only">Approuver</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"
              onClick={() => setIsStatusDialogOpen(true)}
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="sr-only">Changer le statut</span>
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
        customerReturn={customerReturn}
        onStatusChange={onRefresh}
      />
    </>
  );
}
