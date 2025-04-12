
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { CustomReportHeader } from "./components/CustomReportHeader";
import { CustomSalesTotals } from "./components/CustomSalesTotals";
import { CustomProductSalesTable } from "./components/CustomProductSales";
import { CustomClientSalesTable } from "./components/CustomClientSales";
import { useCustomReportQueries } from "./hooks/useCustomReportQueries";

export default function CustomReport() {
  const { toast } = useToast();
  const [selectedPOS, setSelectedPOS] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  // Format dates for the query
  const startDateStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
  const endDateStr = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';

  // Récupérer la liste des points de vente
  const { data: posLocations = [] } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const { 
    salesByProduct, 
    periodTotals, 
    clientSales, 
    isLoading,
    isLoadingSalesProduct,
    isLoadingClients 
  } = useCustomReportQueries(startDateStr, endDateStr);

  const handlePrintClientSales = async () => {
    const element = document.getElementById('client-sales');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.text(`Rapport des ventes par client du ${dateRange?.from?.toLocaleDateString('fr-FR')} au ${dateRange?.to?.toLocaleDateString('fr-FR')}`, 10, 10);
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save(`ventes-par-client-${dateRange?.from?.toLocaleDateString('fr-FR')}.pdf`);

      toast({
        title: "Export réussi",
        description: "Le rapport des ventes par client a été exporté en PDF",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapport en PDF",
      });
    }
  };

  const handlePrintProductSales = async () => {
    const element = document.getElementById('product-sales');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.text(`Rapport des ventes par produit du ${dateRange?.from?.toLocaleDateString('fr-FR')} au ${dateRange?.to?.toLocaleDateString('fr-FR')}`, 10, 10);
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save(`ventes-par-produit-${dateRange?.from?.toLocaleDateString('fr-FR')}.pdf`);

      toast({
        title: "Export réussi",
        description: "Le rapport des ventes par produit a été exporté en PDF",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapport en PDF",
      });
    }
  };

  return (
    <div className="p-6 space-y-8">
      <CustomReportHeader 
        dateRange={dateRange}
        handlePrintClientSales={handlePrintClientSales}
        handlePrintProductSales={handlePrintProductSales}
      />

      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-80">
          <label className="block text-sm font-medium mb-2">Point de vente</label>
          <Select value={selectedPOS} onValueChange={setSelectedPOS}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un point de vente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les PDV</SelectItem>
              {posLocations.map((pos) => (
                <SelectItem key={pos.id} value={pos.id}>
                  {pos.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-96">
          <label className="block text-sm font-medium mb-2">Période</label>
          <DatePickerWithRange 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
        </div>
      </div>

      <div className="space-y-8">
        {/* Résumé des totaux */}
        <CustomSalesTotals periodTotals={periodTotals} />

        {/* Tableau des ventes par produit */}
        <CustomProductSalesTable 
          salesByProduct={salesByProduct} 
          isLoading={isLoadingSalesProduct} 
        />

        {/* Tableau des ventes par client */}
        <CustomClientSalesTable 
          clientSales={clientSales} 
          isLoading={isLoadingClients} 
        />
      </div>
    </div>
  );
}
