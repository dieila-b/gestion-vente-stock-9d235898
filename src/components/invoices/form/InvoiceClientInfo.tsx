import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useExtendedTables } from "@/hooks/use-supabase-table-extension";
import { safeGetProperty, isSelectQueryError } from "@/utils/supabase-helpers";

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

export const InvoiceClientInfo = ({ 
  formData, 
  onInputChange,
  onPosLocationChange 
}: InvoiceClientInfoProps) => {
  const { posLocations } = useExtendedTables();
  
  const { data: posLocationList, setPosLocationList } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      try {
        const { data, error } = await posLocations
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        setPosLocationList(data || []);
      } catch (err) {
        console.error('Error fetching POS locations:', err);
        toast({
          title: "Error",
          description: "Failed to load POS locations",
          variant: "destructive",
        });
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
            {posLocationList?.map((location) => (
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
