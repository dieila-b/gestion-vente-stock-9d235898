
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Client } from "@/types/client";
import { AddClientForm } from "@/components/clients/AddClientForm";
import { EditClientForm } from "@/components/clients/EditClientForm";
import { ClientsHeader } from "./ClientsHeader";
import { ClientsToolbar } from "./ClientsToolbar";
import { ClientsTable } from "./ClientsTable";
import { db } from "@/utils/db-adapter";

const ClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clientTypeFilter, setClientTypeFilter] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        // Utiliser l'adaptateur db pour récupérer les clients
        const data = await db.query<Client[]>(
          'clients',
          q => q.select('*').order('created_at', { ascending: false }),
          []
        );
        
        // Add default status if not present to conform to Client type
        return (data || []).map(client => ({
          ...client,
          status: client.status || "particulier" 
        })) as Client[];
      } catch (error: any) {
        toast.error("Erreur lors du chargement des clients");
        console.error("Error loading clients:", error);
        return [];
      }
    }
  });

  const filteredClients = clients?.filter(client => {
    // Apply search query filter
    const matchesSearch = !searchQuery ? true : (
      client.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.client_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Apply client type filter
    const matchesType = !clientTypeFilter ? true : 
      (client.client_type?.toLowerCase() === clientTypeFilter.toLowerCase());
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <ClientsHeader 
        setIsAddClientOpen={setIsAddClientOpen} 
        clients={clients}
      />

      <ClientsToolbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        clientTypeFilter={clientTypeFilter}
        setClientTypeFilter={setClientTypeFilter} 
      />

      <ClientsTable 
        filteredClients={filteredClients} 
        isLoading={isLoading}
        setSelectedClient={setSelectedClient}
      />

      <AddClientForm 
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />

      {selectedClient && (
        <EditClientForm
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

export default ClientsPage;
