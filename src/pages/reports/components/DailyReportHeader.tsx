
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface DailyReportHeaderProps {
  handlePrint: () => void;
  handleExport: () => void;
}

export function DailyReportHeader() {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
    toast({
      title: "Impression lancée",
      description: "Le rapport a été envoyé à l'imprimante",
    });
  };

  const handleExport = async () => {
    const element = document.getElementById('daily-report');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport-quotidien-${new Date().toLocaleDateString('fr-FR')}.pdf`);

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

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Synthèse Quotidienne</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
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
  );
}
