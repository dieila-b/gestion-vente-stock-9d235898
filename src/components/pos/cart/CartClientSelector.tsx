
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { UserPlus, Search, User, X, AlertCircle } from "lucide-react";
import { QuickClientForm } from "../QuickClientForm";

interface CartClientSelectorProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client) => void;
}

export function CartClientSelector({ selectedClient, onClientSelect }: CartClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('company_name', { ascending: true });
        
        if (error) {
          console.error("Error fetching clients:", error);
          throw error;
        }
        
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
    onClientSelect(newClient);
    setIsQuickFormOpen(false);
    toast.success("Client créé et sélectionné avec succès");
  };

  const handleSearchFocus = () => {
    setShowResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleSelectClient = (client: Client) => {
    onClientSelect(client);
    setSearchTerm("");
    setShowResults(false);
  };

  const handleClearClient = () => {
    onClientSelect(null as any);
  };

  if (selectedClient) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-green-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-green-800 truncate">
              {selectedClient.company_name || selectedClient.contact_name || "Client sans nom"}
            </p>
            {selectedClient.phone && (
              <p className="text-xs text-green-600">
                {selectedClient.phone}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearClient}
          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Indicateur client requis */}
      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md border border-red-200">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs font-medium">Client requis</span>
      </div>

      {/* Ligne horizontale avec recherche et nouveau client */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-7 h-8 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsQuickFormOpen(true)}
          className="h-8 px-2 text-xs"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Nouveau
        </Button>
      </div>

      {/* Résultats de recherche */}
      {showResults && (
        <div className="max-h-[200px] overflow-y-auto space-y-1 border rounded-md bg-background shadow-lg">
          {isLoading ? (
            <div className="p-2 text-center text-muted-foreground text-xs">Chargement...</div>
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <Button
                key={client.id}
                variant="ghost"
                className="w-full justify-start p-2 h-auto text-xs"
                onClick={() => handleSelectClient(client)}
              >
                <div className="text-left w-full">
                  <div className="font-medium">
                    {client.company_name || client.contact_name || "Client sans nom"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {client.phone && <div>Tél: {client.phone}</div>}
                    {client.client_code && <div>Code: {client.client_code}</div>}
                  </div>
                </div>
              </Button>
            ))
          ) : searchTerm ? (
            <div className="p-2 text-center text-muted-foreground text-xs">
              Aucun client trouvé pour "{searchTerm}"
            </div>
          ) : (
            <div className="p-2 text-center text-muted-foreground text-xs">
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
