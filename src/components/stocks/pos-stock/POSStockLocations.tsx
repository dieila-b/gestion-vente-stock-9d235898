
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
    <div className="space-y-6">
      <POSLocationsTable 
        posLocations={filteredPOSLocations} 
        searchQuery={posSearchQuery}
        setSearchQuery={setPosSearchQuery}
        onEdit={onSelectLocation}
      />
    </div>
  );
}
