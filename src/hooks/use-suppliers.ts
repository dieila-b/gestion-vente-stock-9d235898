
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-core";
import { safeSupplier } from "@/utils/data-safe/safe-access";

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
        
        return data.map(supplier => {
          const safeSupplierData = safeSupplier(supplier);
          return safeSupplierData || {
            id: '',
            name: 'Fournisseur inconnu',
            contact: '',
            email: '',
            phone: '',
            address: '',
            website: '',
            status: 'pending'
          };
        });
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        return [];
      }
    }
  });
}
