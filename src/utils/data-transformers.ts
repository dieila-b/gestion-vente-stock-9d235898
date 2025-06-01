
import { POSLocation } from "@/types/pos-locations";
import { Client } from "@/types/client";
import { safeGet } from "@/utils/data-safe/safe-access";
import { safePOSLocation, safeClient } from "@/utils/supabase-safe-query";

// Safe transformer for POS locations
export function transformPOSLocation(item: any): POSLocation {
  return safePOSLocation(item);
}

// Map an array of POS locations safely
export function transformPOSLocations(items: any[]): POSLocation[] {
  if (!Array.isArray(items)) return [];
  return items.map(item => transformPOSLocation(item));
}

// Safe transformer for Clients
export function transformClient(item: any): Client {
  if (!item || typeof item !== 'object') {
    return {
      id: '',
      company_name: 'Client non disponible',
      status: 'inactive',
      created_at: '',
      updated_at: ''
    };
  }
  
  return {
    id: safeGet(item, 'id', ''),
    company_name: safeGet(item, 'company_name', 'Client non disponible'),
    contact_name: safeGet(item, 'contact_name', ''),
    client_code: safeGet(item, 'client_code', ''),
    client_type: safeGet(item, 'client_type', ''),
    email: safeGet(item, 'email', ''),
    phone: safeGet(item, 'phone', ''),
    mobile_1: safeGet(item, 'mobile_1', ''),
    whatsapp: safeGet(item, 'whatsapp', ''),
    address: safeGet(item, 'address', ''),
    city: safeGet(item, 'city', ''),
    state: safeGet(item, 'state', ''),
    postal_code: safeGet(item, 'postal_code', ''),
    country: safeGet(item, 'country', ''),
    notes: safeGet(item, 'notes', ''),
    credit_limit: safeGet(item, 'credit_limit', 0),
    tax_number: safeGet(item, 'tax_number', ''),
    rc_number: safeGet(item, 'rc_number', ''),
    cc_number: safeGet(item, 'cc_number', ''),
    payment_terms: safeGet(item, 'payment_terms', ''),
    status: safeGet(item, 'status', 'inactive'),
    created_at: safeGet(item, 'created_at', ''),
    updated_at: safeGet(item, 'updated_at', '')
  };
}

// Map an array of clients safely
export function transformClients(items: any[]): Client[] {
  if (!Array.isArray(items)) return [];
  return items.map(item => transformClient(item));
}
