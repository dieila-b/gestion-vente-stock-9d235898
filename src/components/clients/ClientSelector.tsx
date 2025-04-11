
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle } from "lucide-react";

interface ClientSelectorProps {
  value: Client | null;
  onChange: (client: Client | null) => void;
}

export function ClientSelector({ value, onChange }: ClientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  const filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (client.company_name && client.company_name.toLowerCase().includes(query)) ||
      (client.contact_name && client.contact_name.toLowerCase().includes(query)) ||
      (client.phone && client.phone.toLowerCase().includes(query)) ||
      (client.email && client.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-2">
      {showSearch ? (
        <div className="flex space-x-2">
          <Input
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowSearch(false)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <Select
            value={value?.id || ''}
            onValueChange={(val) => {
              const selectedClient = clients.find(c => c.id === val) || null;
              onChange(selectedClient);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {filteredClients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.company_name || client.contact_name || 'Client sans nom'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
