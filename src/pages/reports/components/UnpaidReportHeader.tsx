
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ClientSelect } from "@/components/clients/ClientSelect";
import { Client } from "@/types/client_unified"; // Updated import

interface UnpaidReportHeaderProps {
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onClearFilter: () => void;
  handlePrint: () => void;
  handleExport: () => void;
}

export function UnpaidReportHeader({ 
  selectedClient,
  onSelectClient,
  onClearFilter,
  handlePrint,
  handleExport
}: UnpaidReportHeaderProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Factures Impayées</h1>
          <p className="text-muted-foreground">
            Liste de toutes les factures avec un solde restant
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
      
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-2">Filtrer par client</h2>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <ClientSelect 
              selectedClient={selectedClient} 
              onClientSelect={(client: any) => onSelectClient(client)}
              onClearClient={onClearFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
