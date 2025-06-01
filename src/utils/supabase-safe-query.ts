
import { supabase } from "@/integrations/supabase/client";

// Fonction utilitaire pour récupérer un enregistrement par ID de manière sécurisée
export const safeFetchRecordById = async (
  table: string,
  id: string,
  selectQuery: string = '*',
  defaultValue: any = null,
  errorMessage: string = "Erreur lors de la récupération"
) => {
  try {
    const { data, error } = await supabase
      .from(table as any)
      .select(selectQuery)
      .eq('id', id)
      .single();
    
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

// Fonction générique pour récupérer depuis une table
export const safeFetchFromTable = async (
  tableName: string,
  query?: (q: any) => any,
  defaultValue: any = []
) => {
  try {
    let queryBuilder = supabase.from(tableName as any).select('*');
    
    if (query) {
      queryBuilder = query(queryBuilder);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error(`Erreur lors de la récupération de ${tableName}:`, error);
      return defaultValue;
    }
    
    return data || defaultValue;
  } catch (err) {
    console.error(`Erreur lors de la récupération de ${tableName}:`, err);
    return defaultValue;
  }
};

// Fonction pour créer un objet produit sécurisé
export const safeProduct = (product: any) => {
  if (!product) {
    return {
      id: '',
      name: 'Produit inconnu',
      price: 0,
      purchase_price: 0,
      reference: '',
      image_url: null,
      stock: 0,
      category: '',
      description: ''
    };
  }
  
  return {
    ...product,
    name: product.name || 'Produit inconnu',
    price: product.price || 0,
    purchase_price: product.purchase_price || 0,
    reference: product.reference || '',
    stock: product.stock || 0,
    category: product.category || '',
    description: product.description || ''
  };
};

// Fonction pour créer un objet fournisseur sécurisé
export const safeSupplier = (supplier: any) => {
  if (!supplier) {
    return {
      id: '',
      name: 'Fournisseur inconnu',
      email: '',
      phone: '',
      address: '',
      status: 'pending'
    };
  }
  
  return {
    ...supplier,
    name: supplier.name || 'Fournisseur inconnu',
    email: supplier.email || '',
    phone: supplier.phone || '',
    address: supplier.address || '',
    status: supplier.status || 'pending'
  };
};

// Fonction pour créer un objet client sécurisé
export const safeClient = (client: any) => {
  if (!client) {
    return {
      id: '',
      company_name: 'Client inconnu',
      contact_name: '',
      email: '',
      phone: '',
      address: ''
    };
  }
  
  return {
    ...client,
    company_name: client.company_name || 'Client inconnu',
    contact_name: client.contact_name || '',
    email: client.email || '',
    phone: client.phone || '',
    address: client.address || ''
  };
};

// Fonction pour créer un objet point de vente sécurisé
export const safePOSLocation = (posLocation: any) => {
  if (!posLocation) {
    return {
      id: '',
      name: 'Point de vente inconnu',
      phone: '',
      email: '',
      address: '',
      status: 'inactive',
      is_active: false,
      manager: '',
      capacity: 0,
      occupied: 0,
      surface: 0,
      created_at: '',
      updated_at: null
    };
  }
  
  return {
    ...posLocation,
    name: posLocation.name || 'Point de vente inconnu',
    phone: posLocation.phone || '',
    email: posLocation.email || '',
    address: posLocation.address || '',
    status: posLocation.status || 'inactive',
    is_active: posLocation.is_active || false,
    manager: posLocation.manager || '',
    capacity: posLocation.capacity || 0,
    occupied: posLocation.occupied || 0,
    surface: posLocation.surface || 0,
    created_at: posLocation.created_at || '',
    updated_at: posLocation.updated_at || null
  };
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

// Fonction pour vérifier les erreurs de requête
export const isSelectQueryError = (error: any) => {
  return error && error.code;
};

// Fonction générique pour récupérer des données avec gestion d'erreur
export const safeGet = async (queryFunction: () => Promise<any>, defaultValue: any = null) => {
  try {
    const result = await queryFunction();
    return result;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return defaultValue;
  }
};
