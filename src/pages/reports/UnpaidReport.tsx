import { useState } from "react";
import { addDays, subMonths } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DateRange } from "react-day-picker";
import { UnpaidReportHeader } from "./components/UnpaidReportHeader";
import { UnpaidReportSummary } from "./components/UnpaidReportSummary";
import { UnpaidInvoicesTable } from "./components/UnpaidInvoicesTable";
import { useUnpaidInvoices } from "./hooks/useUnpaidInvoices";
import { Client } from "@/types/client";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function UnpaidReport() {
  const { toast } = useToast();
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });

  const { data: unpaidInvoices, isLoading } = useUnpaidInvoices(date, selectedClient?.id);

  const handleSort = (key: string) => {
    setSortConfig((currentConfig) => ({
      key,
      direction: currentConfig.key === key && currentConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedInvoices = [...(unpaidInvoices || [])].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    switch (sortConfig.key) {
      case 'created_at':
        return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'client':
        const aName = a.client?.contact_name || a.client?.company_name || '';
        const bName = b.client?.contact_name || b.client?.company_name || '';
        return direction * (aName.localeCompare(bName));
      case 'amount':
        return direction * (a.amount - b.amount);
      case 'remaining_amount':
        return direction * (a.remaining_amount - b.remaining_amount);
      case 'payment_status':
        return direction * (a.payment_status.localeCompare(b.payment_status));
      default:
        return 0;
    }
  });

  const totals = unpaidInvoices?.reduce((acc, invoice) => ({
    total: acc.total + invoice.amount,
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
    const element = document.getElementById('unpaid-report');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport-impayes-${date?.from?.toLocaleDateString('fr-FR')}-${date?.to?.toLocaleDateString('fr-FR')}.pdf`);

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

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Factures Clients Impayées</h1>
        <div className="mt-4">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <UnpaidReportHeader
        date={date}
        setDate={setDate}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        onPrint={handlePrint}
        onExport={handleExport}
      />

      <div id="unpaid-report" className="space-y-8">
        <UnpaidReportSummary totals={totals || { total: 0, paid: 0, remaining: 0 }} />
        <UnpaidInvoicesTable
          invoices={sortedInvoices}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}
