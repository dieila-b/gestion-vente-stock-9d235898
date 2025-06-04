
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
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucune facture d'achat trouvée</p>
        <p className="text-sm mt-2">Les factures d'achat apparaîtront ici après approbation des bons de livraison</p>
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
        return <Badge variant="outline">{status || 'Non défini'}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status || 'Non défini'}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N° Facture</TableHead>
          <TableHead>Date création</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead>Montant total</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Statut paiement</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">
              {invoice.invoice_number || `FA-${invoice.id?.substring(0, 8)}`}
            </TableCell>
            <TableCell>
              {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('fr-FR') : 'N/A'}
            </TableCell>
            <TableCell>
              {invoice.supplier?.name || 'Fournisseur non défini'}
              {invoice.supplier?.phone && (
                <div className="text-xs text-gray-500">{invoice.supplier.phone}</div>
              )}
            </TableCell>
            <TableCell className="font-medium">
              {formatGNF(invoice.total_amount || 0)}
            </TableCell>
            <TableCell>
              {getStatusBadge(invoice.status)}
            </TableCell>
            <TableCell>
              {getPaymentStatusBadge(invoice.payment_status)}
            </TableCell>
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
