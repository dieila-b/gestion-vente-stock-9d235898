
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { POSLocation } from "@/types/pos-locations";

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

  // Create a click handler for table rows to select a location
  const handleRowClick = (location: POSLocation) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
  };

  return (
    <div className="space-y-6">
      <POSLocationsTable 
        posLocations={filteredPOSLocations} 
        searchQuery={posSearchQuery}
        setSearchQuery={setPosSearchQuery}
      />
      
      {/* Add click event handlers directly to the table rows */}
      <style jsx global>{`
        .pos-location-row {
          cursor: ${onSelectLocation ? 'pointer' : 'default'};
        }
        .pos-location-row:hover {
          background-color: rgba(138, 133, 255, 0.1);
        }
      `}</style>
      
      {onSelectLocation && (
        <div className="text-sm text-gray-400 mt-2">
          Cliquez sur une ligne pour sélectionner un PDV
        </div>
      )}
    </div>
  );
}
