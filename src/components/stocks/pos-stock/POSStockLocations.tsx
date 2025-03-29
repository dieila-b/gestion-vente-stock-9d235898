
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { POSLocation } from "@/types/pos-locations";
import { useEffect, useRef } from "react";

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

  // Reference to the table component
  const tableRef = useRef<HTMLDivElement>(null);

  // Add click event handlers to the table rows after component mounts
  useEffect(() => {
    if (tableRef.current && onSelectLocation) {
      const rows = tableRef.current.querySelectorAll('.border-b.border-[#333]');
      
      rows.forEach((row, index) => {
        if (index > 0 && index <= filteredPOSLocations.length) {
          // Add cursor pointer style
          row.classList.add('cursor-pointer');
          
          // Add hover style
          row.classList.add('hover:bg-[rgba(138,133,255,0.1)]');
          
          // Add click event
          row.addEventListener('click', () => {
            handleRowClick(filteredPOSLocations[index - 1]);
          });
        }
      });
    }
    
    // Cleanup event listeners on unmount
    return () => {
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll('.border-b.border-[#333]');
        rows.forEach(row => {
          row.removeEventListener('click', () => {});
        });
      }
    };
  }, [filteredPOSLocations, onSelectLocation]);

  return (
    <div className="space-y-6" ref={tableRef}>
      <POSLocationsTable 
        posLocations={filteredPOSLocations} 
        searchQuery={posSearchQuery}
        setSearchQuery={setPosSearchQuery}
      />
      
      {onSelectLocation && (
        <div className="text-sm text-gray-400 mt-2">
          Cliquez sur une ligne pour sélectionner un PDV
        </div>
      )}
    </div>
  );
}
