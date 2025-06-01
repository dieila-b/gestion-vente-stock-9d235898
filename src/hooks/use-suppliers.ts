
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-core";
import { safeGet } from "@/utils/data-safe/safe-access";

interface SupplierData {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  status: string;
  [key: string]: any;
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        const data = await db.query<SupplierData>('suppliers', q => q.select('*'));
        
        return data.map(supplier => ({
          id: safeGet(supplier, 'id', ''),
          name: safeGet(supplier, 'name', 'Fournisseur inconnu'),
          contact: safeGet(supplier, 'contact', ''),
          email: safeGet(supplier, 'email', ''),
          phone: safeGet(supplier, 'phone', ''),
          address: safeGet(supplier, 'address', ''),
          website: safeGet(supplier, 'website', ''),
          status: safeGet(supplier, 'status', 'pending'),
          ...supplier
        }));
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        return [];
      }
    }
  });
}
