
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientSelect } from "@/components/pos/ClientSelect";
import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";

type PaymentMethod = 'cash' | 'bank_transfer' | 'check' | 'mobile_money';

export default function Payments() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: clientBalance } = useQuery({
    queryKey: ['clientBalance', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient?.id) return null;
      const { data: client } = await supabase
        .from('clients')
        .select('balance')
        .eq('id', selectedClient.id)
        .single();
      return client?.balance || 0;
    },
    enabled: !!selectedClient?.id
  });

  const handlePayment = async () => {
    if (!selectedClient) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Processing payment:', {
        clientId: selectedClient.id,
        amount: amount,
        paymentMethod,
        notes
      });
      
      // Create payment record
      const { error } = await supabase
        .from('payments')
        .insert({
          client_id: selectedClient.id,
          amount: amount,
          payment_method: paymentMethod,
          notes
        });

      if (error) {
        console.error('Error creating payment:', error);
        throw error;
      }

      // Update cash register
      const { data: cashRegister, error: cashRegisterError } = await supabase
        .from('cash_registers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (cashRegisterError) {
        console.error('Error fetching cash register:', cashRegisterError);
        throw cashRegisterError;
      }
      
      if (cashRegister && cashRegister.length > 0) {
        const clientName = selectedClient.company_name || 
                         selectedClient.contact_name || 
                         "Client";
        
        console.log('Adding transaction to cash register:', {
          cashRegisterId: cashRegister[0].id,
          amount: amount,
          clientName
        });
        
        const { error: transactionError } = await supabase
          .from('cash_register_transactions')
          .insert([{
            cash_register_id: cashRegister[0].id,
            amount: amount,
            type: 'deposit',
            description: `Encaissement versement: ${clientName}`
          }]);
        
        if (transactionError) {
          console.error('Error adding cash register transaction:', transactionError);
          throw transactionError;
        }
      } else {
        console.warn('No active cash register found');
      }

      toast.success("Paiement enregistré avec succès");
      
      // Reset form
      setAmount(0);
      setNotes('');
      setSelectedClient(null);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Erreur lors de l'enregistrement du paiement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Versement</h1>
      <p className="text-muted-foreground mb-6">
        Gérez les versements des clients
      </p>

      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client</label>
          <ClientSelect
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
          />
          {selectedClient && clientBalance !== null && (
            <p className="text-sm text-muted-foreground">
              Solde actuel: {clientBalance.toLocaleString('fr-FR')} DZD
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Montant</label>
          <FormattedNumberInput
            placeholder="Entrer le montant"
            value={amount}
            onChange={setAmount}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Méthode de paiement</label>
          <Select
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Espèces</SelectItem>
              <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
              <SelectItem value="check">Chèque</SelectItem>
              <SelectItem value="mobile_money">Paiement mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            placeholder="Notes additionnelles"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button 
          onClick={handlePayment} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Traitement..." : "Enregistrer le versement"}
        </Button>
      </div>
    </div>
  );
}

