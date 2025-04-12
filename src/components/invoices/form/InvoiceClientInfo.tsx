
import React from 'react';
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { createTableQuery } from '@/hooks/use-supabase-table-extension';
import { isSelectQueryError } from '@/utils/supabase-helpers';
import { safeMap } from '@/utils/select-query-helper';

interface InvoiceClientInfoProps {
  formData: {
    clientName: string;
    clientEmail: string;
    invoiceNumber: string;
    vatRate: string;
    posLocationId?: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPosLocationChange?: (value: string) => void;
}

export const InvoiceClientInfo: React.FC<InvoiceClientInfoProps> = ({ 
  formData, 
  onInputChange,
  onPosLocationChange 
}) => {
  const { data: posLocationList = [], isLoading } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      try {
        // Get POS locations using the createTableQuery utility
        const response = await createTableQuery('pos_locations')
          .select('*')
          .order('name');
          
        const { data, error } = response;
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error('Error fetching POS locations:', err);
        toast.error("Failed to load POS locations");
        return [];
      }
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Numéro de facture</label>
        <Input
          name="invoiceNumber"
          value={formData.invoiceNumber}
          readOnly
          className="enhanced-glass bg-white/5 cursor-not-allowed"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Point de vente</label>
        <Select 
          value={formData.posLocationId} 
          onValueChange={onPosLocationChange}
        >
          <SelectTrigger className="enhanced-glass">
            <SelectValue placeholder="Sélectionner un point de vente" />
          </SelectTrigger>
          <SelectContent>
            {!isSelectQueryError(posLocationList) && Array.isArray(posLocationList) && 
              posLocationList.map((location: any) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name || 'Unnamed location'}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Taux de TVA (%)</label>
        <Input
          name="vatRate"
          type="number"
          value={formData.vatRate}
          onChange={onInputChange}
          className="enhanced-glass"
          placeholder="20"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Nom du client</label>
        <Input
          name="clientName"
          value={formData.clientName}
          onChange={onInputChange}
          className="enhanced-glass"
          placeholder="Entrez le nom du client"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Email du client</label>
        <Input
          name="clientEmail"
          type="email"
          value={formData.clientEmail}
          onChange={onInputChange}
          className="enhanced-glass"
          placeholder="client@example.com"
        />
      </div>
    </div>
  );
};
