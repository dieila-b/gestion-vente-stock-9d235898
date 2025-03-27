
import { useState } from "react";
import { InvoiceHeader } from "@/components/invoices/InvoiceHeader";
import { InvoiceStats } from "@/components/invoices/InvoiceStats";
import { InvoiceFormWrapper } from "@/components/invoices/InvoiceFormWrapper";
import { InvoiceTypeCard } from "@/components/invoices/InvoiceTypeCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Invoices() {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch invoices data
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des factures");
        throw error;
      }

      return data;
    },
    refetchInterval: 5000, // Rafraîchit les données toutes les 5 secondes
    staleTime: 0 // Considère les données comme périmées immédiatement
  });

  const handleGenerateInvoice = () => {
    setIsCreating(true);
    // Invalide le cache des factures pour forcer un rechargement
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  return (
    <div className="p-6 space-y-8">
      <InvoiceHeader onGenerateInvoice={handleGenerateInvoice} />
      
      <InvoiceStats />

      {isCreating && (
        <InvoiceFormWrapper 
          onClose={() => {
            setIsCreating(false);
            // Invalide le cache à la fermeture du formulaire
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
          }} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceTypeCard />
        <div className="h-96 enhanced-glass rounded-xl p-6">
          {/* Graphique des ventes sera ajouté ici */}
        </div>
      </div>
    </div>
  );
}
