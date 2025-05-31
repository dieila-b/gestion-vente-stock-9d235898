
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatGNF } from "@/lib/currency";
import { formatDateTime } from "@/lib/formatters";
import { Search, Eye, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SalesInvoices() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['sales-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_invoices')
        .select(`
          *,
          clients:client_id(company_name, contact_name, phone, email),
          orders:order_id(id, status)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clients?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clients?.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      'paid': 'default',
      'partial': 'secondary',
      'pending': 'destructive'
    } as const;
    
    const labels = {
      'paid': 'Payé',
      'partial': 'Partiel',
      'pending': 'En attente'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getDeliveryStatusBadge = (status: string) => {
    const variants = {
      'delivered': 'default',
      'partial': 'secondary',
      'awaiting': 'outline',
      'pending': 'destructive'
    } as const;
    
    const labels = {
      'delivered': 'Livré',
      'partial': 'Partiel',
      'awaiting': 'En attente',
      'pending': 'En attente'
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Factures de Vente</h1>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par numéro de facture ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">N° Facture</th>
                  <th className="text-left p-4">Client</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Montant Total</th>
                  <th className="text-left p-4">Statut Paiement</th>
                  <th className="text-left p-4">Statut Livraison</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8">
                      Chargement...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{invoice.invoice_number}</td>
                      <td className="p-4">
                        {invoice.clients?.company_name || invoice.clients?.contact_name || 'Client comptoir'}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDateTime(invoice.created_at)}
                      </td>
                      <td className="p-4 font-medium">
                        {formatGNF(invoice.total_amount)}
                      </td>
                      <td className="p-4">
                        {getPaymentStatusBadge(invoice.payment_status)}
                      </td>
                      <td className="p-4">
                        {getDeliveryStatusBadge(invoice.delivery_status)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
