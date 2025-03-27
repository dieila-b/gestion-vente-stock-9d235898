
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { DateRange } from "react-day-picker";

interface CustomReportHeaderProps {
  dateRange?: DateRange;
  handlePrintClientSales: () => void;
  handlePrintProductSales: () => void;
}

export function CustomReportHeader({ 
  dateRange,
  handlePrintClientSales,
  handlePrintProductSales
}: CustomReportHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Synthèse Date à Date</h1>
        <p className="text-muted-foreground">
          Rapport personnalisé du {dateRange?.from?.toLocaleDateString('fr-FR')} au {dateRange?.to?.toLocaleDateString('fr-FR')}
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={handlePrintClientSales}
        >
          <FileText className="h-4 w-4 mr-2" />
          Imprimer Ventes/Client
        </Button>
        <Button 
          variant="outline"
          onClick={handlePrintProductSales}
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimer Ventes/Produit
        </Button>
      </div>
    </div>
  );
}
