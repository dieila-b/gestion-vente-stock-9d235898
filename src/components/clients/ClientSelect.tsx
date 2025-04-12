
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, User, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";
import { Dispatch, SetStateAction } from "react";

export interface ClientSelectProps {
  selectedClient?: Client | null;
  onClientSelect?: (client: Client) => void;
  onClearClient?: () => void;
  disabled?: boolean;
}

export function ClientSelect({ 
  selectedClient, 
  onClientSelect,
  onClearClient,
  disabled = false 
}: ClientSelectProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

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

  useEffect(() => {
    if (search && clients) {
      const lowercaseSearch = search.toLowerCase();
      const filtered = clients.filter(
        client => 
          (client.company_name && client.company_name.toLowerCase().includes(lowercaseSearch)) ||
          (client.contact_name && client.contact_name.toLowerCase().includes(lowercaseSearch)) ||
          (client.phone && client.phone.includes(search)) ||
          (client.client_code && client.client_code.toLowerCase().includes(lowercaseSearch))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  }, [search, clients]);

  const handleSearchFocus = () => {
    setShowResults(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleSelectClient = (client: Client) => {
    if (onClientSelect) {
      onClientSelect(client);
    }
    setSearch("");
    setShowResults(false);
  };

  const handleClearClient = () => {
    if (onClearClient) {
      onClearClient();
    }
  };

  if (selectedClient) {
    return (
      <div className="bg-secondary/20 rounded-md p-4 flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <p className="font-medium">
              {selectedClient.company_name || selectedClient.contact_name || "Client sans nom"}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedClient.phone || selectedClient.email || ''}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearClient}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            disabled={disabled}
          />
        </div>
        <Button variant="outline" size="icon" disabled={disabled}>
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      {showResults && filteredClients.length > 0 && (
        <div className="absolute mt-1 w-full bg-background border rounded-md shadow-lg z-10 max-h-64 overflow-auto">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-2 hover:bg-accent cursor-pointer"
              onClick={() => handleSelectClient(client)}
            >
              <div className="font-medium">
                {client.company_name || client.contact_name || "Client sans nom"}
              </div>
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>{client.phone || ''}</span>
                <span>{client.balance ? `${client.balance.toLocaleString('fr-FR')} €` : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && search && filteredClients.length === 0 && (
        <div className="absolute mt-1 w-full bg-background border rounded-md shadow-lg z-10 p-4 text-center">
          <p className="text-muted-foreground">Aucun client trouvé</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            disabled={disabled}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Créer un nouveau client
          </Button>
        </div>
      )}
    </div>
  );
}
