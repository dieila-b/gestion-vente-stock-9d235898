
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { safeFetchFromTable } from "@/utils/supabase-safe-query";
import { UserPlus } from "lucide-react";
import { QuickClientForm } from "./QuickClientForm";

interface ClientSelectProps {
  selectedClient: Client | null;
  onClientSelect: (client: Client) => void;
}

export function ClientSelect({ selectedClient, onClientSelect }: ClientSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const clients = await safeFetchFromTable(
          'clients',
          (query) => query.order('company_name'),
          [],
          "Erreur lors de la récupération des clients"
        );
        
        return clients;
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Erreur lors de la récupération des clients");
        return [];
      }
    }
  });

  const filteredClients = clients.filter(client => 
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientCreated = (newClient: Client) => {
    onClientSelect(newClient);
    setIsQuickFormOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button 
          variant="outline" 
          onClick={() => setIsQuickFormOpen(true)}
          className="flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nouveau client</span>
        </Button>
        {selectedClient && (
          <Button 
            variant="ghost" 
            onClick={() => onClientSelect(null as any)}
            size="sm"
          >
            Effacer
          </Button>
        )}
      </div>
      
      {selectedClient ? (
        <div className="p-3 border rounded-md">
          <div className="font-semibold">{selectedClient.company_name}</div>
          <div className="text-sm text-muted-foreground">{selectedClient.contact_name}</div>
          <div className="text-sm text-muted-foreground">{selectedClient.phone}</div>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {isLoading ? (
            <div className="p-3 text-center text-muted-foreground">Chargement...</div>
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <Button
                key={client.id}
                variant="ghost"
                className="w-full justify-start p-3 h-auto"
                onClick={() => onClientSelect(client)}
              >
                <div className="text-left">
                  <div className="font-semibold">{client.company_name}</div>
                  <div className="text-sm text-muted-foreground">{client.contact_name}</div>
                  <div className="text-sm text-muted-foreground">{client.phone}</div>
                </div>
              </Button>
            ))
          ) : (
            <div className="p-3 text-center text-muted-foreground">Aucun client trouvé</div>
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
