import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Client } from "@/types/client";

type SortField = 'date' | 'order_id' | 'total' | 'paid' | 'remaining' | null;
type SortDirection = 'asc' | 'desc';

export function useClientReport() {
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
        .select('id, company_name, contact_name, status')
        .order('company_name');

      if (error) throw error;
      return data as Client[];
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

  return {
    selectedClient,
    setSelectedClient,
    date,
    setDate,
    clients,
    isLoadingClients,
    isLoading,
    allClientInvoices,
    clientInvoices,
    totals,
    currentPage,
    totalPages,
    itemsPerPage,
    sortField,
    sortDirection,
    handleSort,
    handlePrint,
    handleExport,
    handlePageChange,
    handleItemsPerPageChange
  };
}
