import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from "react-day-picker";
import { supabase } from '@/integrations/supabase/client';
import { transformToUnpaidInvoice } from '@/utils/data-transformers';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UnpaidInvoicesTable } from '@/components/reports/UnpaidInvoicesTable';
import { UnpaidInvoicesSummary } from '@/components/reports/UnpaidInvoicesSummary';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { exportToExcel } from '@/lib/export-utils';

export default function UnpaidReport() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [selectedClient, setSelectedClient] = useState<string | undefined>();
  const [groupByClient, setGroupByClient] = useState(false);

  // Fetch clients for filter dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name, contact_name')
        .order('company_name');
        
      if (error) throw error;
      return data;
    }
  });

  // Utility function to get client display name
  const getClientDisplayName = (client: any) => {
    if (!client) return "N/A";
    
    // Check if client is a SelectQueryError by checking for error property
    if (client.error) {
      return "Client Inconnu";
    }
    
    return client.contact_name || client.company_name || "N/A";
  };

  // Fetch unpaid invoices data
  const { data: unpaidData = [], isLoading } = useQuery({
    queryKey: ['unpaid-invoices', dateRange?.from, dateRange?.to, selectedClient],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      let query = supabase
        .from('orders')
        .select(`
          id,
          created_at,
          client_id,
          final_total,
          paid_amount,
          remaining_amount,
          payment_status,
          client:clients(id, company_name, contact_name),
          items:order_items(id)
        `)
        .in('payment_status', ['pending', 'partial'])
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (selectedClient) {
        query = query.eq('client_id', selectedClient);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Unpaid invoices data:", data);
      
      // Transform the data to the required format
      return transformToUnpaidInvoice(data.map(order => ({
        id: order.id,
        created_at: order.created_at,
        client: order.client,
        client_id: order.client_id,
        invoice_number: `FACT-${order.id.slice(0, 8)}`,
        amount: order.final_total,
        paid_amount: order.paid_amount,
        remaining_amount: order.remaining_amount,
        payment_status: order.payment_status,
        items_count: order.items ? order.items.length : 0
      })));
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Rapport des Factures Impayées</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportToExcel(unpaidData, 'factures-impayees')}
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date-range">Période</Label>
                <DateRangePicker
                  id="date-range"
                  value={dateRange}
                  onValueChange={setDateRange}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="client">Client</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Tous les clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company_name || client.contact_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="group-by-client"
                  checked={groupByClient}
                  onCheckedChange={setGroupByClient}
                />
                <Label htmlFor="group-by-client">Grouper par client</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
          </CardHeader>
          <CardContent>
            <UnpaidInvoicesSummary data={unpaidData} />
          </CardContent>
        </Card>

        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle>Liste des Factures Impayées</CardTitle>
          </CardHeader>
          <CardContent>
            <UnpaidInvoicesTable
              data={unpaidData}
              isLoading={isLoading}
              groupByClient={groupByClient}
              getClientDisplayName={getClientDisplayName}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
