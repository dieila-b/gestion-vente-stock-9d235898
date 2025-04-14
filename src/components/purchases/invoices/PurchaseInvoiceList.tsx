
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { PurchaseInvoice } from "@/types/PurchaseInvoice";

interface PurchaseInvoiceListProps {
  invoices: PurchaseInvoice[];
  isLoading: boolean;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PurchaseInvoiceList({
  invoices,
  isLoading,
  onView,
  onDelete
}: PurchaseInvoiceListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune facture d'achat trouvée
      </div>
    );
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">En attente</Badge>;
      case 'partial':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Partiel</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Payé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N° Facture</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Statut paiement</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
            <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
            <TableCell>{invoice.supplier?.name || 'N/A'}</TableCell>
            <TableCell>{formatGNF(invoice.total_amount)}</TableCell>
            <TableCell>{getPaymentStatusBadge(invoice.payment_status)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onView(invoice.id)}
                  title="Voir"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(invoice.id)}
                  title="Supprimer"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
