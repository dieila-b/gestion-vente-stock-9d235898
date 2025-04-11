
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface POSLocation {
  id: string;
  name: string;
}

interface POSStockLocationsProps {
  onLocationChange: (locationId: string) => void;
  selectedLocation: string;
}

export function POSStockLocations({ onLocationChange, selectedLocation }: POSStockLocationsProps) {
  const [locations, setLocations] = useState<POSLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        // Use direct query instead of useExtendedTables to avoid type errors
        const { data, error } = await supabase
          .from('pos_locations')
          .select('id, name')
          .order('name');

        if (error) throw error;
        
        setLocations(data || []);
        
        // If no location is selected and we have locations, select the first one
        if (!selectedLocation && data && data.length > 0) {
          onLocationChange(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching POS locations:', error);
        toast.error("Erreur lors du chargement des points de vente");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [onLocationChange, selectedLocation]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Point de Vente</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedLocation}
          onValueChange={onLocationChange}
          disabled={isLoading || locations.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Chargement..." : "Sélectionner un point de vente"} />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
