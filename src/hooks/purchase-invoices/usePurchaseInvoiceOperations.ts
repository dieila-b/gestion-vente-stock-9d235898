
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePurchaseInvoiceOperations = () => {
  const queryClient = useQueryClient();

  // Récupérer les factures d'achat avec leurs relations
  const { data: purchaseInvoices = [], isLoading } = useQuery({
    queryKey: ['purchase-invoices-complete'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers (*),
          purchase_order:purchase_orders (*),
          delivery_note:delivery_notes (*),
          purchase_invoice_items (
            *,
            product:catalog (*)
          ),
          purchase_invoice_payments (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Créer une facture d'achat
  const createPurchaseInvoiceMutation = useMutation({
    mutationFn: async ({ invoice, items }: { invoice: any; items: any[] }) => {
      // Créer la facture d'achat
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('purchase_invoices')
        .insert({
          ...invoice,
          paid_amount: 0,
          remaining_amount: invoice.total_amount,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Créer les éléments de la facture
      if (items.length > 0) {
        const invoiceItems = items.map(item => ({
          ...item,
          purchase_invoice_id: newInvoice.id
        }));

        const { error: itemsError } = await supabase
          .from('purchase_invoice_items')
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      return newInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices-complete'] });
      toast.success("Facture d'achat créée avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  });

  // Ajouter un paiement à une facture d'achat
  const addPaymentMutation = useMutation({
    mutationFn: async ({ invoiceId, payment }: { invoiceId: string; payment: any }) => {
      const { data, error } = await supabase
        .from('purchase_invoice_payments')
        .insert({
          ...payment,
          purchase_invoice_id: invoiceId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices-complete'] });
      toast.success("Paiement ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'ajout du paiement: ${error.message}`);
    }
  });

  return {
    purchaseInvoices,
    isLoading,
    createPurchaseInvoice: createPurchaseInvoiceMutation.mutate,
    addPayment: addPaymentMutation.mutate,
    isCreating: createPurchaseInvoiceMutation.isPending,
    isAddingPayment: addPaymentMutation.isPending
  };
};
