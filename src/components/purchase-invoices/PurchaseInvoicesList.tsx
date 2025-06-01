
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export function PurchaseInvoicesList() {
  const { data: purchaseInvoices = [], isLoading } = useQuery({
    queryKey: ['purchase-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">En retard</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Factures d'Achat</h2>
      </div>
      
      <div className="space-y-4">
        {purchaseInvoices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune facture d'achat
          </p>
        ) : (
          purchaseInvoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{invoice.invoice_number || 'FA-XXXX'}</h3>
                <p className="text-sm text-muted-foreground">
                  {invoice.supplier?.name || 'Fournisseur inconnu'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(invoice.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(invoice.status)}
                <p className="text-sm text-muted-foreground mt-1">
                  {invoice.total_amount?.toLocaleString('fr-FR')} GNF
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
