import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from "react-day-picker";
import { transformToClientInvoices } from '@/utils/data-transformers';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientInvoicesTable } from '@/components/reports/ClientInvoicesTable';
import { ClientSummary } from '@/components/reports/ClientSummary';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToExcel } from '@/lib/export-utils';

export default function ClientsReport() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [selectedClient, setSelectedClient] = useState<string | undefined>();

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

  // Fetch orders data based on date range and client filter
  const { data: invoicesData = [], isLoading } = useQuery({
    queryKey: ['client-invoices', dateRange?.from, dateRange?.to, selectedClient],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      let query = supabase
        .from('orders')
        .select(`
          id,
          client_id,
          created_at,
          final_total,
          paid_amount,
          remaining_amount,
          payment_status,
          client:clients(*),
          items:order_items(*)
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (selectedClient) {
        query = query.eq('client_id', selectedClient);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to the required format
      return transformToClientInvoices(data || []);
    },
    enabled: !!dateRange?.from && !!dateRange?.to
  });

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rapport des Clients</h1>
        <Button 
          variant="outline" 
          onClick={() => exportToExcel(invoicesData, 'rapport-clients')}
          disabled={isLoading || invoicesData.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Période</label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Client</label>
            <Select
              value={selectedClient}
              onValueChange={setSelectedClient}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>Tous les clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company_name || client.contact_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résumé</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientSummary invoices={invoicesData} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Factures</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientInvoicesTable 
            invoices={invoicesData} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
