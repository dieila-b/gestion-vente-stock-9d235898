
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useInvoiceOperations = () => {
  const queryClient = useQueryClient();

  // Récupérer les factures avec leurs éléments et paiements
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices-complete'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (
            *,
            product:catalog (*)
          ),
          invoice_payments (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Créer une facture avec ses éléments
  const createInvoiceMutation = useMutation({
    mutationFn: async ({ invoice, items }: { invoice: any; items: any[] }) => {
      // Créer la facture
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
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
          invoice_id: newInvoice.id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }

      return newInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices-complete'] });
      toast.success("Facture créée avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  });

  // Ajouter un paiement à une facture
  const addPaymentMutation = useMutation({
    mutationFn: async ({ invoiceId, payment }: { invoiceId: string; payment: any }) => {
      const { data, error } = await supabase
        .from('invoice_payments')
        .insert({
          ...payment,
          invoice_id: invoiceId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices-complete'] });
      toast.success("Paiement ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'ajout du paiement: ${error.message}`);
    }
  });

  // Supprimer une facture
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices-complete'] });
      toast.success("Facture supprimée avec succès");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  return {
    invoices,
    isLoading,
    createInvoice: createInvoiceMutation.mutate,
    addPayment: addPaymentMutation.mutate,
    deleteInvoice: deleteInvoiceMutation.mutate,
    isCreating: createInvoiceMutation.isPending,
    isAddingPayment: addPaymentMutation.isPending,
    isDeleting: deleteInvoiceMutation.isPending
  };
};
