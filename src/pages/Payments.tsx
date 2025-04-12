
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClientSelect } from "@/components/pos/ClientSelect";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client } from "@/types/client";
import { formatCurrency } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { safeGet } from "@/utils/supabase-safe-query";

// Let's add a proper type for the payment
interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
  notes?: string;
}

export default function Payments() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientBalance, setClientBalance] = useState<number>(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const { toast } = useToast();

  // Fetch client balance and payment history when client is selected
  useEffect(() => {
    if (selectedClient) {
      const fetchClientData = async () => {
        try {
          // Get client balance
          const balance = safeGet(selectedClient, 'balance', 0);
          setClientBalance(balance);

          // Get client payment history
          const { data, error } = await supabase
            .from('client_payments')
            .select('*')
            .eq('client_id', selectedClient.id)
            .order('date', { ascending: false });

          if (error) throw error;
          setPayments(data || []);
        } catch (error) {
          console.error("Error fetching client data:", error);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les données du client",
            variant: "destructive"
          });
        }
      };

      fetchClientData();
    } else {
      setClientBalance(0);
      setPayments([]);
    }
  }, [selectedClient]);

  const handleSubmitPayment = async () => {
    if (!selectedClient) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive"
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save payment to database
      const { error: paymentError } = await supabase
        .from('client_payments')
        .insert({
          client_id: selectedClient.id,
          amount: parseFloat(amount),
          method: paymentMethod,
          reference: reference || null,
          notes: notes || null,
          date: new Date().toISOString()
        });

      if (paymentError) throw paymentError;

      // Update client balance
      const newBalance = clientBalance - parseFloat(amount);
      const { error: clientError } = await supabase
        .from('clients')
        .update({ balance: newBalance })
        .eq('id', selectedClient.id);

      if (clientError) throw clientError;

      toast({
        title: "Succès",
        description: `Paiement de ${formatCurrency(parseFloat(amount))} enregistré pour ${selectedClient.company_name}`,
      });

      // Reset form
      setAmount("");
      setReference("");
      setNotes("");
      setClientBalance(newBalance);

      // Refresh payment history
      const { data } = await supabase
        .from('client_payments')
        .select('*')
        .eq('client_id', selectedClient.id)
        .order('date', { ascending: false });

      if (data) setPayments(data);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le paiement",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Paiements Clients</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Enregistrer un paiement</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Client</label>
                <ClientSelect
                  selectedClient={selectedClient}
                  onClientSelect={setSelectedClient}
                />
              </div>

              {selectedClient && (
                <>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium">Solde actuel</p>
                    <p className={`text-xl font-bold ${clientBalance > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {formatCurrency(clientBalance)}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Montant du paiement</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Méthode de paiement</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="cash">Espèces</option>
                      <option value="transfer">Virement</option>
                      <option value="check">Chèque</option>
                      <option value="card">Carte bancaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Référence (optionnel)</label>
                    <Input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Numéro de chèque, référence de virement..."
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">Notes (optionnel)</label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes additionnelles..."
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSubmitPayment}
                    disabled={isLoading || !amount || parseFloat(amount) <= 0}
                  >
                    {isLoading ? "Traitement..." : "Enregistrer le paiement"}
                  </Button>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historique des paiements</h2>
            {selectedClient ? (
              payments.length > 0 ? (
                <div className="space-y-4">
                  <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">Tous</TabsTrigger>
                      <TabsTrigger value="recent">Récents</TabsTrigger>
                      <TabsTrigger value="old">Anciens</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="max-h-[500px] overflow-auto">
                      {payments.map((payment) => (
                        <div key={payment.id} className="border-b py-3">
                          <div className="flex justify-between">
                            <span className="font-medium">{formatCurrency(payment.amount)}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm mt-1">
                            <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                              {payment.method === 'cash' ? 'Espèces' :
                               payment.method === 'transfer' ? 'Virement' :
                               payment.method === 'check' ? 'Chèque' : 'Carte bancaire'}
                            </span>
                            {payment.reference && (
                              <span className="ml-2 text-muted-foreground">{payment.reference}</span>
                            )}
                          </div>
                          {payment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{payment.notes}</p>
                          )}
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="recent" className="max-h-[500px] overflow-auto">
                      {payments.filter((_, i) => i < 5).map((payment) => (
                        <div key={payment.id} className="border-b py-3">
                          <div className="flex justify-between">
                            <span className="font-medium">{formatCurrency(payment.amount)}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm mt-1">
                            <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                              {payment.method === 'cash' ? 'Espèces' :
                               payment.method === 'transfer' ? 'Virement' :
                               payment.method === 'check' ? 'Chèque' : 'Carte bancaire'}
                            </span>
                            {payment.reference && (
                              <span className="ml-2 text-muted-foreground">{payment.reference}</span>
                            )}
                          </div>
                          {payment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{payment.notes}</p>
                          )}
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="old" className="max-h-[500px] overflow-auto">
                      {payments.filter((_, i) => i >= 5).map((payment) => (
                        <div key={payment.id} className="border-b py-3">
                          <div className="flex justify-between">
                            <span className="font-medium">{formatCurrency(payment.amount)}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm mt-1">
                            <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                              {payment.method === 'cash' ? 'Espèces' :
                               payment.method === 'transfer' ? 'Virement' :
                               payment.method === 'check' ? 'Chèque' : 'Carte bancaire'}
                            </span>
                            {payment.reference && (
                              <span className="ml-2 text-muted-foreground">{payment.reference}</span>
                            )}
                          </div>
                          {payment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{payment.notes}</p>
                          )}
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  Aucun paiement enregistré pour ce client
                </div>
              )
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                Sélectionnez un client pour voir son historique de paiements
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
