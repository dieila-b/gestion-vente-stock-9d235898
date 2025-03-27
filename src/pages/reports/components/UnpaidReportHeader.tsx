
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ClientSelect } from "@/components/pos/ClientSelect";
import { Client } from "@/types/client";

interface UnpaidReportHeaderProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  onPrint: () => void;
  onExport: () => void;
}

export function UnpaidReportHeader({ 
  date, 
  setDate, 
  selectedClient,
  setSelectedClient,
  onPrint, 
  onExport 
}: UnpaidReportHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Factures Clients Impayées</h1>
          <p className="text-muted-foreground mt-1">
            {selectedClient ? (
              <>Client: {selectedClient.company_name || selectedClient.contact_name}</>
            ) : (
              <>Tous les clients</>
            )}
          </p>
          <p className="text-muted-foreground">
            Période: du {date?.from?.toLocaleDateString('fr-FR')} au {date?.to?.toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button 
            variant="outline"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">Période</label>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Client</label>
          <ClientSelect
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
          />
        </div>
      </div>
    </>
  );
}
