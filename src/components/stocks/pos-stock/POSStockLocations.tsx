
import { POSLocationsTable } from "@/components/pos-locations/POSLocationsTable";
import { POSLocation } from "@/types/pos-locations";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Get latest occupation data for each location
  const { data: updatedLocations } = useQuery({
    queryKey: ['pos-locations-with-occupation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as POSLocation[];
    }
  });

  // Merge updated occupation data with locations
  const locationsWithUpdatedOccupation = posLocations.map(location => {
    const updatedLocation = updatedLocations?.find(u => u.id === location.id);
    return updatedLocation || location;
  });

  // Filter locations based on the search query
  const filteredPOSLocations = locationsWithUpdatedOccupation.filter(location =>
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

  // Add click event handlers to table rows
  useEffect(() => {
    if (tableRef.current && onSelectLocation) {
      const tableElement = tableRef.current.querySelector('table');
      if (!tableElement) return;
      
      const rows = tableElement.querySelectorAll('tbody tr');
      
      rows.forEach((row, index) => {
        if (index < filteredPOSLocations.length) {
          // Add cursor pointer style
          row.classList.add('cursor-pointer');
          
          // Add hover style
          row.classList.add('hover:bg-opacity-10', 'hover:bg-purple-500');
          
          // Add click event
          row.addEventListener('click', () => {
            handleRowClick(filteredPOSLocations[index]);
          });
        }
      });
    }
    
    // Cleanup event listeners on unmount
    return () => {
      if (tableRef.current) {
        const tableElement = tableRef.current.querySelector('table');
        if (!tableElement) return;
        
        const rows = tableElement.querySelectorAll('tbody tr');
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
