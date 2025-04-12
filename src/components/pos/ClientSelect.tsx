
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Client } from "@/types/client";
import { supabase } from "@/integrations/supabase/client";
import { Command } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, UserSearch, AlertCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AddClientForm } from "@/components/clients/AddClientForm";
import { toast } from "sonner";

interface ClientSelectProps {
  value: Client | null;
  onChange?: (client: Client | null) => void;
  selectedClient?: Client | null;
}

export const ClientSelect = ({ value, onChange, selectedClient }: ClientSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);

  const { data: clientsData = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .order("company_name");

        if (error) {
          throw error;
        }

        return (data as any[]).map(client => ({
          ...client,
          status: client.status || "active"
        })) as Client[];
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Erreur lors du chargement des clients");
        return [];
      }
    },
  });

  const handleSelectClient = (client: Client | null) => {
    onChange?.(client);
    if (showAddClient) setShowAddClient(false);
  };

  const filteredClients = clientsData?.filter(client => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      client.company_name?.toLowerCase().includes(searchLower) ||
      client.contact_name?.toLowerCase().includes(searchLower) ||
      client.phone?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={value ? "outline" : "destructive"}
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-[300px] justify-between enhanced-glass", 
              !value && "border-2 border-red-500"
            )}
          >
            {value ? (
              <div className="flex items-center gap-2">
                <span>{value.company_name || value.contact_name}</span>
                {value.contact_name && value.company_name && (
                  <span className="text-sm text-muted-foreground">
                    ({value.contact_name})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Client requis</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 neo-blur z-50" align="start" side="bottom">
          <Command>
            <div className="flex items-center border-b border-white/10 px-3">
              <UserSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="max-h-[300px] overflow-auto">
              {filteredClients?.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    handleSelectClient(client);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-white/10",
                    value?.id === client.id && "bg-white/10"
                  )}
                >
                  <div className="flex-1">
                    <div className="font-medium">{client.company_name || client.contact_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {client.company_name && client.contact_name && client.contact_name}
                      {client.phone && ` • ${client.phone}`}
                    </div>
                  </div>
                  {value?.id === client.id && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-white/10">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setShowAddClient(true);
                  setIsOpen(false);
                }}
              >
                <UserPlus className="h-4 w-4" />
                Nouveau client
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      <AddClientForm 
        isOpen={showAddClient} 
        onClose={() => setShowAddClient(false)} 
      />
    </div>
  );
};
