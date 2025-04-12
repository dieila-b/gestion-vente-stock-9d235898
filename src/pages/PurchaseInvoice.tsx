import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformToPurchaseInvoices } from '@/utils/data-transformers';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface PurchaseInvoiceTableProps {
  data: any[];
  isLoading: boolean;
}

const PurchaseInvoiceTable = ({ data, isLoading }: PurchaseInvoiceTableProps) => {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-10">
          Chargement des factures...
        </TableCell>
      </TableRow>
    );
  }

  if (data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-10">
          Aucune facture trouvée
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {data.map((invoice) => (
        <TableRow key={invoice.id}>
          <TableCell>{invoice.invoice_number}</TableCell>
          <TableCell>{formatDate(invoice.issue_date)}</TableCell>
          <TableCell>{invoice.supplier?.name || 'Fournisseur inconnu'}</TableCell>
          <TableCell>{invoice.delivery_note?.delivery_number || 'N/A'}</TableCell>
          <TableCell>
            <Badge
              variant={
                invoice.payment_status === 'paid' ? 'outline' :
                invoice.payment_status === 'partial' ? 'outline' :
                'outline'
              }
              className={
                invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                'bg-red-100 text-red-800 hover:bg-red-100'
              }
            >
              {invoice.payment_status === 'paid' ? 'Payée' :
               invoice.payment_status === 'partial' ? 'Partielle' :
               'En attente'}
            </Badge>
          </TableCell>
          <TableCell>{invoice.total_amount.toLocaleString('fr-FR')} GNF</TableCell>
          <TableCell>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Voir
              </Button>
              <Button variant="outline" size="sm">
                Payer
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

const PurchaseInvoice = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch purchase invoices
  const { data: rawInvoices = [], isLoading } = useQuery({
    queryKey: ['purchase-invoices', filterStatus, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers(*),
          delivery_note:delivery_notes(*)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (searchQuery) {
        query = query.or(`invoice_number.ilike.%${searchQuery}%,supplier.name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }
  });

  // Transform the raw invoices to the required format
  const invoices = transformToPurchaseInvoices(rawInvoices);

  // Create new invoice
  const handleCreateInvoice = async () => {
    try {
      // Form data for the new invoice
      const invoiceData = {
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        supplier_id: '', // You should add a supplier selection in the form
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total_amount: 0,
        tax_amount: 0,
        payment_status: 'pending',
        paid_amount: 0,
        remaining_amount: 0,
        status: 'draft',
        notes: '',
        shipping_cost: 0
      };
      
      // Insert the new invoice
      const { error } = await supabase
        .from('purchase_invoices')
        .insert(invoiceData);
        
      if (error) throw error;
      
      // Refetch invoices
      // You'd typically use a React Query mutation here with automatic refetching
      
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Factures d'achat</h1>
            <p className="text-muted-foreground">
              Gérez vos factures fournisseurs
            </p>
          </div>
          <Button onClick={handleCreateInvoice}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle facture
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="partial">Partielle</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Bon de livraison</TableHead>
                  <TableHead>Statut paiement</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <PurchaseInvoiceTable
                  data={invoices}
                  isLoading={isLoading}
                />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseInvoice;
