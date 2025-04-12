
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { OrderCard } from "@/components/orders/OrderCard";
import { CardContent } from "@/components/ui/card";

export function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  const { data: preorders = [], refetch: refetchPreorders } = useQuery({
    queryKey: ['preorders', activeTab],
    enabled: true,
    queryFn: async () => {
      // Filtrer par statut basé sur l'onglet actif
      let query = supabase
        .from('preorders')
        .select(`
          *,
          client:clients(id, company_name, contact_name, phone, email),
          items:preorder_items(
            id, 
            product_id, 
            quantity, 
            unit_price, 
            total_price,
            status,
            product:catalog(id, name, stock, category)
          )
        `)
        
      if (activeTab !== "all") {
        query = query.eq('status', activeTab);
      }
        
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handlePaymentSubmit = async (amount: number, paymentMethod: string, notes?: string, delivered?: boolean) => {
    setIsUpdating(true);
    try {
      // Calculer le nouveau montant payé et restant
      const newPaidAmount = selectedOrder.paid_amount + amount;
      const newRemainingAmount = selectedOrder.total_amount - newPaidAmount;
      
      // Déterminer le nouveau statut
      let newStatus = selectedOrder.status;
      if (delivered) {
        newStatus = 'delivered';
      } else if (newRemainingAmount <= 0) {
        newStatus = 'paid';
      } else if (newPaidAmount > 0 && newRemainingAmount > 0) {
        newStatus = 'partial';
      }

      // Mettre à jour la précommande
      const { error: preorderError } = await supabase
        .from('preorders')
        .update({
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (preorderError) throw preorderError;

      // Enregistrer le paiement
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: selectedOrder.client.id,
          amount: amount,
          payment_method: paymentMethod,
          notes: `Versement précommande #${selectedOrder.id} ${notes ? '- ' + notes : ''}`
        });

      if (paymentError) throw paymentError;

      toast.success("Paiement enregistré avec succès");
      refetchPreorders();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Erreur lors du traitement du paiement");
    } finally {
      setIsUpdating(false);
      setShowPaymentDialog(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Gestion des Précommandes</h1>
        <p className="text-muted-foreground">
          Suivez et gérez les précommandes clients
        </p>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="partial">Paiement partiel</TabsTrigger>
          <TabsTrigger value="paid">Payée</TabsTrigger>
          <TabsTrigger value="delivered">Livrée</TabsTrigger>
          <TabsTrigger value="canceled">Annulée</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {preorders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucune précommande</h3>
                <p className="text-center text-muted-foreground">
                  Il n'y a pas de précommande avec ce statut actuellement.
                </p>
              </CardContent>
            </Card>
          ) : (
            preorders.map((order: any) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                isUpdating={isUpdating}
                setIsUpdating={setIsUpdating} 
                refetchPreorders={refetchPreorders}
                setSelectedOrder={setSelectedOrder}
                setShowPaymentDialog={setShowPaymentDialog}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {showPaymentDialog && selectedOrder && (
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          totalAmount={selectedOrder.remaining_amount}
          onSubmitPayment={handlePaymentSubmit}
          items={selectedOrder.items.map((item: any) => ({
            id: item.id,
            name: item.product?.name || `Produit #${item.product_id}`,
            quantity: item.quantity
          }))}
        />
      )}
    </div>
  );
}
