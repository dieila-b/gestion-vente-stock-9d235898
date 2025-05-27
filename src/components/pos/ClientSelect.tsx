
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { UserPlus, Search, User, X } from "lucide-react";
import { QuickClientForm } from "./QuickClientForm";

interface ClientSelectProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client) => void;
}

export function ClientSelect({ selectedClient, onClientSelect }: ClientSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        console.log("Fetching clients for POS...");
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('company_name', { ascending: true });
        
        if (error) {
          console.error("Error fetching clients:", error);
          throw error;
        }
        
        console.log("Clients fetched:", data?.length || 0);
        return data as Client[];
      } catch (error) {
        console.error("Error in client query:", error);
        toast.error("Erreur lors de la récupération des clients");
        return [];
      }
    }
  });

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (client.company_name && client.company_name.toLowerCase().includes(searchLower)) ||
      (client.contact_name && client.contact_name.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.toLowerCase().includes(searchLower)) ||
      (client.client_code && client.client_code.toLowerCase().includes(searchLower))
    );
  });

  const handleClientCreated = (newClient: Client) => {
    console.log("New client created:", newClient);
    onClientSelect(newClient);
    setIsQuickFormOpen(false);
    toast.success("Client créé et sélectionné avec succès");
  };

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
    console.log("Client selected:", client);
    onClientSelect(client);
    setSearchTerm("");
    setShowResults(false);
  };

  const handleClearClient = () => {
    onClientSelect(null as any);
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
            {selectedClient.client_code && (
              <p className="text-xs text-muted-foreground">
                Code: {selectedClient.client_code}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClearClient}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsQuickFormOpen(true)}
          className="flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nouveau</span>
        </Button>
      </div>

      {showResults && (
        <div className="max-h-[300px] overflow-y-auto space-y-1 border rounded-md bg-background">
          {isLoading ? (
            <div className="p-3 text-center text-muted-foreground">Chargement...</div>
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <Button
                key={client.id}
                variant="ghost"
                className="w-full justify-start p-3 h-auto"
                onClick={() => handleSelectClient(client)}
              >
                <div className="text-left w-full">
                  <div className="font-semibold">
                    {client.company_name || client.contact_name || "Client sans nom"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {client.contact_name && client.company_name && (
                      <div>Contact: {client.contact_name}</div>
                    )}
                    {client.phone && <div>Tél: {client.phone}</div>}
                    {client.client_code && <div>Code: {client.client_code}</div>}
                  </div>
                </div>
              </Button>
            ))
          ) : searchTerm ? (
            <div className="p-3 text-center text-muted-foreground">
              Aucun client trouvé pour "{searchTerm}"
            </div>
          ) : (
            <div className="p-3 text-center text-muted-foreground">
              Tapez pour rechercher un client
            </div>
          )}
        </div>
      )}
      
      <QuickClientForm
        isOpen={isQuickFormOpen}
        onClose={() => setIsQuickFormOpen(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
}
