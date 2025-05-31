
import { supabase } from "@/integrations/supabase/client";

// Fonction utilitaire pour récupérer un enregistrement par ID de manière sécurisée
export const safeFetchRecordById = async (
  table: string,
  id: string,
  selectQuery: (query: any) => any = (q) => q,
  defaultValue: any = null,
  errorMessage: string = "Erreur lors de la récupération"
) => {
  try {
    const { data, error } = await selectQuery(
      supabase.from(table).select('*').eq('id', id).single()
    );
    
    if (error) {
      console.error(`${errorMessage}:`, error);
      return defaultValue;
    }
    
    return data;
  } catch (err) {
    console.error(`${errorMessage}:`, err);
    return defaultValue;
  }
};

// Fonction pour créer un objet facture sécurisé avec toutes les propriétés requises
export const safeInvoice = (invoice: any) => {
  if (!invoice) {
    return {
      id: '',
      invoice_number: '',
      client_id: null,
      total_amount: 0,
      paid_amount: 0,
      remaining_amount: 0,
      payment_status: 'pending' as const,
      delivery_status: 'pending' as const,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  return {
    ...invoice,
    paid_amount: invoice.paid_amount || 0,
    remaining_amount: invoice.remaining_amount || (invoice.total_amount - (invoice.paid_amount || 0)),
    payment_status: invoice.payment_status || 'pending',
    delivery_status: invoice.delivery_status || 'pending'
  };
};

// Fonction pour créer un objet facture d'achat sécurisé
export const safePurchaseInvoice = (invoice: any) => {
  if (!invoice) {
    return {
      id: '',
      invoice_number: '',
      supplier_id: null,
      total_amount: 0,
      paid_amount: 0,
      remaining_amount: 0,
      payment_status: 'pending',
      tax_amount: 0,
      due_date: new Date().toISOString(),
      discount: 0,
      notes: '',
      shipping_cost: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  return {
    ...invoice,
    paid_amount: invoice.paid_amount || 0,
    remaining_amount: invoice.remaining_amount || (invoice.total_amount - (invoice.paid_amount || 0)),
    payment_status: invoice.payment_status || 'pending',
    tax_amount: invoice.tax_amount || 0,
    discount: invoice.discount || 0,
    shipping_cost: invoice.shipping_cost || 0
  };
};
