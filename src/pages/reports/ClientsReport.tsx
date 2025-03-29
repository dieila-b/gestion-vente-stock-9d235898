import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { subMonths } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Download, Printer, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DateRange } from "react-day-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type SortField = 'date' | 'order_id' | 'total' | 'paid' | 'remaining' | null;
type SortDirection = 'asc' | 'desc';

export default function ClientsReport() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name, contact_name')
        .order('company_name');

      if (error) throw error;
      return data;
    }
  });

  const { data: allClientInvoices = [], isLoading } = useQuery({
    queryKey: ['client-invoices-all', date?.from, date?.to, selectedClient],
    enabled: !!date?.from && !!date?.to && !!selectedClient,
    queryFn: async () => {
      if (!date?.from || !date?.to || !selectedClient) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          client_id,
          created_at,
          final_total,
          paid_amount,
          remaining_amount,
          payment_status,
          client:clients(company_name, contact_name),
          items:order_items(
            id,
            quantity,
            price,
            total,
            discount,
            products:products(name)
          )
        `)
        .eq('client_id', selectedClient)
        .gte('created_at', date.from.toISOString())
        .lte('created_at', date.to.toISOString())
        .order('created_at');

      if (error) throw error;
      return data;
    }
  });

  const sortInvoices = (a: any, b: any) => {
    if (!sortField) return 0;
    
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'date') {
      return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    
    if (sortField === 'order_id') {
      return direction * a.id.localeCompare(b.id);
    }
    
    if (sortField === 'total') {
      return direction * (a.final_total - b.final_total);
    }
    
    if (sortField === 'paid') {
      return direction * (a.paid_amount - b.paid_amount);
    }
    
    if (sortField === 'remaining') {
      return direction * (a.remaining_amount - b.remaining_amount);
    }
    
    return 0;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedInvoices = [...allClientInvoices].sort(sortInvoices);

  const indexOfLastInvoice = currentPage * itemsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - itemsPerPage;
  const clientInvoices = sortedInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPages = Math.ceil((allClientInvoices?.length || 0) / itemsPerPage);

  const totals = allClientInvoices?.reduce((acc, invoice) => ({
    total: acc.total + invoice.final_total,
    paid: acc.paid + invoice.paid_amount,
    remaining: acc.remaining + invoice.remaining_amount
  }), { total: 0, paid: 0, remaining: 0 });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="inline ml-1 h-4 w-4" /> : 
      <ChevronDown className="inline ml-1 h-4 w-4" />;
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Impression lancée",
      description: "Le rapport a été envoyé à l'imprimante",
    });
  };

  const handleExport = async () => {
    const element = document.getElementById('client-report');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport-client-${date?.from?.toLocaleDateString('fr-FR')}-${date?.to?.toLocaleDateString('fr-FR')}.pdf`);

      toast({
        title: "Export réussi",
        description: "Le rapport a été exporté en PDF",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapport en PDF",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (isLoading && selectedClient) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Synthèse Clients</h1>
        <div className="mt-4">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Synthèse Clients</h1>
          <p className="text-muted-foreground">
            Rapport détaillé des ventes par facture du {date?.from?.toLocaleDateString('fr-FR')} au {date?.to?.toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button 
            variant="outline"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-80">
          <label className="block text-sm font-medium mb-2">Client</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingClients ? (
                <SelectItem value="loading" disabled>Chargement des clients...</SelectItem>
              ) : clients.length > 0 ? (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company_name ? client.company_name : client.contact_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>Aucun client trouvé</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-96">
          <label className="block text-sm font-medium mb-2">Période</label>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      <div id="client-report" className="space-y-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-sm text-muted-foreground">Total des ventes</div>
            <div className="text-2xl font-bold">{formatGNF(totals?.total || 0)}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-sm text-muted-foreground">Montant encaissé</div>
            <div className="text-2xl font-bold text-green-500">{formatGNF(totals?.paid || 0)}</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-sm text-muted-foreground">Reste à payer</div>
            <div className="text-2xl font-bold text-yellow-500">{formatGNF(totals?.remaining || 0)}</div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Détail des factures</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    Date {renderSortIcon('date')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('order_id')}
                  >
                    N° Facture {renderSortIcon('order_id')}
                  </TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('total')}
                  >
                    Total {renderSortIcon('total')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('paid')}
                  >
                    Payé {renderSortIcon('paid')}
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer"
                    onClick={() => handleSort('remaining')}
                  >
                    Reste {renderSortIcon('remaining')}
                  </TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientInvoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{new Date(invoice.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{"FACT-" + invoice.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      {invoice.items.length} articles
                    </TableCell>
                    <TableCell className="text-right">{formatGNF(invoice.final_total)}</TableCell>
                    <TableCell className="text-right text-green-500">
                      {formatGNF(invoice.paid_amount)}
                    </TableCell>
                    <TableCell className="text-right text-yellow-500">
                      {formatGNF(invoice.remaining_amount)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invoice.payment_status === 'paid' 
                          ? 'bg-green-500/10 text-green-500'
                          : invoice.payment_status === 'partial'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {invoice.payment_status === 'paid' 
                          ? 'Payé'
                          : invoice.payment_status === 'partial'
                          ? 'Partiel'
                          : 'En attente'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!clientInvoices || clientInvoices.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {selectedClient ? "Aucune facture trouvée pour ce client sur cette période" : "Veuillez sélectionner un client"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {allClientInvoices.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Afficher</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => handleItemsPerPageChange(Number(value))}
              >
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">par page</span>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber = i + 1;
                  
                  if (totalPages > 5 && currentPage > 3) {
                    pageNumber = currentPage - 3 + i;
                  }
                  
                  if (pageNumber <= totalPages) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={pageNumber === currentPage}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            <div className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages || 1}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
