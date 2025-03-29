
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { DateRange } from "react-day-picker";

interface ClientReportHeaderProps {
  date?: DateRange;
  handlePrint: () => void;
  handleExport: () => void;
}

export function ClientReportHeader({ date, handlePrint, handleExport }: ClientReportHeaderProps) {
  return (
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
  );
}
