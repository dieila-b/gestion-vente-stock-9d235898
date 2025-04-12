
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface ReturnClientSelectProps {
  clientId: string;
  onClientChange: (id: string) => void;
}

export function ReturnClientSelect({ clientId, onClientChange }: ReturnClientSelectProps) {
  const [clients, setClients] = useState<{id: string, company_name: string}[]>([]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, company_name')
        .order('company_name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="client_id">Client</Label>
      <Select
        value={clientId}
        onValueChange={onClientChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.company_name || 'Client sans nom'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
