
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReturnClientSelectProps {
  clientId: string;
  onClientChange: (clientId: string) => Promise<void>;
  clients: any[];
}

export function ReturnClientSelect({ clientId, onClientChange, clients }: ReturnClientSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="client">Client</Label>
      <Select
        value={clientId}
        onValueChange={onClientChange}
      >
        <SelectTrigger id="client">
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.company_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
