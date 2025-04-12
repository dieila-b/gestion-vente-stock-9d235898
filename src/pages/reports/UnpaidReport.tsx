
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout"; 
import { DateRange } from "@/types/date-range";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card } from "@/components/ui/card";
import { useUnpaidInvoices } from "./hooks/useUnpaidInvoices";
import { Loader2, Download, Printer, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { formatGNF } from "@/lib/currency";
import { columns } from "./components/UnpaidInvoicesColumns";
import { Button } from "@/components/ui/button";
import { UnpaidReportHeader } from "./components/UnpaidReportHeader";
import { Client } from "@/types/client_unified";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/components/ui/use-toast";

export default function UnpaidReport() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  const { invoices, isLoading } = useUnpaidInvoices(dateRange);
  
  // Filter invoices by selected client if any
  const filteredInvoices = selectedClient 
    ? invoices.filter(invoice => invoice.client_id === selectedClient.id)
    : invoices;
    
  // Calculate totals
  const totalUnpaid = filteredInvoices.reduce((sum, invoice) => sum + invoice.remaining_amount, 0);
  const totalInvoiced = filteredInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const totalPaid = filteredInvoices.reduce((sum, invoice) => sum + invoice.paid_amount, 0);
  
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
  };
  
  const handleClearFilter = () => {
    setSelectedClient(null);
  };
  
  const handleExport = async () => {
    try {
      const element = document.getElementById('unpaid-report');
      if (!element) {
        throw new Error("Report element not found");
      }
      
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('factures-impayees.pdf');
      
      toast({
        title: "Rapport exporté",
        description: "Le rapport a été exporté avec succès au format PDF."
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur est survenue lors de l'exportation du rapport.",
        variant: "destructive"
      });
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 sm:p-6">
        <div id="unpaid-report">
          <UnpaidReportHeader 
            selectedClient={selectedClient}
            onSelectClient={(client: Client) => handleSelectClient(client)}
            onClearFilter={handleClearFilter}
            handlePrint={handlePrint}
            handleExport={handleExport}
          />

          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Période</h3>
                <DateRangePicker
                  value={dateRange}
                  onValueChange={setDateRange}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="text-sm text-muted-foreground">Total facturé</div>
                  <div className="text-xl font-semibold">{formatGNF(totalInvoiced)}</div>
                </div>
                
                <div className="rounded-lg p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <div className="text-sm text-muted-foreground">Total payé</div>
                  <div className="text-xl font-semibold">{formatGNF(totalPaid)}</div>
                </div>
                
                <div className="rounded-lg p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                  <div className="text-sm text-muted-foreground">Total impayé</div>
                  <div className="text-xl font-semibold">{formatGNF(totalUnpaid)}</div>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={filteredInvoices} 
                searchPlaceholder="Rechercher une facture..." 
                searchColumn="invoice_number"
              />
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
