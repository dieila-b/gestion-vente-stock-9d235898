
import { isSelectQueryError } from '../safe-access';

/**
 * Safely handle client properties from a relation that could be SelectQueryError
 */
export function safeClient(client: any): { 
  id: string; 
  company_name: string; 
  contact_name?: string;
  status?: string;
  email?: string;
  phone?: string;
  mobile_1?: string;
  whatsapp?: string;
  credit_limit?: number;
  rc_number?: string;
  cc_number?: string;
  created_at: string;
  updated_at: string;
} {
  if (isSelectQueryError(client)) {
    return {
      id: '',
      company_name: 'Erreur de chargement',
      contact_name: '',
      status: 'particulier',
      email: '',
      phone: '',
      mobile_1: '',
      whatsapp: '',
      credit_limit: 0,
      rc_number: '',
      cc_number: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  return {
    ...client,
    status: client.status || 'particulier',
    created_at: client.created_at || new Date().toISOString(),
    updated_at: client.updated_at || new Date().toISOString()
  };
}
