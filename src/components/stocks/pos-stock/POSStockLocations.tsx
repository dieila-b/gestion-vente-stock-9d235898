
import { Card } from "@/components/ui/card";
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { POSLocation } from "@/types/pos-locations";
import { POSStockFilter } from "./POSStockFilter";

interface POSStockLocationsProps {
  posLocations: POSLocation[];
  posSearchQuery: string;
  setPosSearchQuery: (value: string) => void;
  onSelectLocation?: (location: POSLocation) => void;
}

export function POSStockLocations({ 
  posLocations, 
  posSearchQuery, 
  setPosSearchQuery,
  onSelectLocation
}: POSStockLocationsProps) {
  // Filter locations based on the search query
  const filteredPOSLocations = posLocations.filter(location =>
    location.name.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(posSearchQuery.toLowerCase()) ||
    (location.manager && location.manager.toLowerCase().includes(posSearchQuery.toLowerCase()))
  );

  return (
    <Card className="enhanced-glass p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gradient">
            Liste des PDV
          </h2>
          <POSStockFilter 
            posSearchQuery={posSearchQuery} 
            setPosSearchQuery={setPosSearchQuery} 
          />
        </div>

        <POSLocationsTable 
          posLocations={filteredPOSLocations} 
          onEdit={onSelectLocation}
        />
      </div>
    </Card>
  );
}
