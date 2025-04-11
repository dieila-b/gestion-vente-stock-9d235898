
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from 'sonner';
import { createTableQuery } from '@/hooks/use-supabase-table-extension';

interface POSLocation {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  manager?: string;
  status?: string;
  is_active?: boolean;
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
        // Use createTableQuery instead of direct supabase client
        const response = await createTableQuery('pos_locations')
          .select('id, name, phone, address, status, is_active')
          .order('name');

        const { data, error } = response;
        if (error) throw error;
        
        // Transform the data into the POSLocation format
        const locationData = (data || []).map(item => ({
          id: item.id,
          name: item.name || 'Unnamed location',
          phone: item.phone,
          address: item.address,
          status: item.status,
          is_active: item.is_active
        }));
        
        setLocations(locationData);
        
        // If no location is selected and we have locations, select the first one
        if (!selectedLocation && locationData && locationData.length > 0) {
          onLocationChange(locationData[0].id);
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
