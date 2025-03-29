
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { POSLocation } from "@/types/pos-locations";
import {
  Table,
  TableBody,
} from "@/components/ui/table";

// Import the new components
import { POSLocationRow } from "./table/POSLocationRow";
import { POSLocationsEmptyState } from "./table/POSLocationsEmptyState";
import { POSLocationSearchBar } from "./table/POSLocationSearchBar";
import { POSLocationDeleteDialog } from "./table/POSLocationDeleteDialog";
import { POSLocationsTableHeader } from "./table/POSLocationsTableHeader";

interface POSLocationsTableProps {
  posLocations: POSLocation[];
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onEdit?: (location: POSLocation) => void;
  onDelete?: (location: POSLocation) => Promise<void>;
}

export function POSLocationsTable({ 
  posLocations, 
  searchQuery = "",
  setSearchQuery = () => {},
  onEdit,
  onDelete
}: POSLocationsTableProps) {
  const [locationToDelete, setLocationToDelete] = useState<POSLocation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Log all locations including their occupancy data
  console.log("POSLocationsTable received locations:", posLocations.map(loc => ({
    id: loc.id,
    name: loc.name,
    occupied: loc.occupied,
    capacity: loc.capacity,
    occupancyRate: loc.capacity > 0 ? Math.round((loc.occupied / loc.capacity) * 100) : 0
  })));

  const handleDeleteClick = (location: POSLocation) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (locationToDelete && onDelete) {
      await onDelete(locationToDelete);
      setIsDeleteDialogOpen(false);
      setLocationToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {setSearchQuery && (
        <POSLocationSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )}

      <div className="rounded-md border border-[#333] overflow-hidden">
        <Table>
          <POSLocationsTableHeader hasActions={!!(onEdit || onDelete)} />
          <TableBody className="bg-black/20">
            {posLocations.length === 0 ? (
              <POSLocationsEmptyState colSpan={onEdit || onDelete ? 8 : 7} />
            ) : (
              posLocations.map((location) => (
                <POSLocationRow 
                  key={location.id} 
                  location={location} 
                  onEdit={onEdit} 
                  onDelete={handleDeleteClick} 
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <POSLocationDeleteDialog 
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        locationToDelete={locationToDelete}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
}
