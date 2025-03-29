
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Client } from "@/types/client";

interface ClientReportFilterProps {
  selectedClient: string;
  setSelectedClient: (value: string) => void;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  clients: Client[];
  isLoadingClients: boolean;
}

export function ClientReportFilter({ 
  selectedClient, 
  setSelectedClient, 
  date, 
  setDate, 
  clients, 
  isLoadingClients 
}: ClientReportFilterProps) {
  return (
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
  );
}
