
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientSelectorProps {
  value: string;
  onChange: (clientId: string) => void;
  disabled?: boolean;
}

export const ClientSelector = ({ value, onChange, disabled = false }: ClientSelectorProps) => {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name', { ascending: true });
        
      if (error) throw error;
      return data as Client[];
    }
  });

  return (
    <div className="space-y-2">
      <Label htmlFor="client">Client</Label>
      <Select 
        value={value} 
        onValueChange={onChange} 
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-full" id="client">
          <SelectValue placeholder="Sélectionner un client" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Chargement...</SelectItem>
          ) : (
            clients.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.company_name || client.contact_name || `Client #${client.id}`}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
