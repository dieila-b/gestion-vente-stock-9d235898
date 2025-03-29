
import { Edit, Trash2, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { POSLocation } from "@/types/pos-locations";

interface POSLocationRowProps {
  location: POSLocation;
  onEdit?: (location: POSLocation) => void;
  onDelete?: (location: POSLocation) => void;
}

export function POSLocationRow({ location, onEdit, onDelete }: POSLocationRowProps) {
  // Ensure occupied and capacity are treated as numbers
  const occupied = typeof location.occupied === 'number' ? location.occupied : 0;
  const capacity = typeof location.capacity === 'number' ? location.capacity : 0;
  
  // Calculate actual occupation rate based on current data
  const occupancyRate = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
  
  // Set color based on occupancy rate
  let occupancyClass = "text-green-400";
  if (occupancyRate >= 90) {
    occupancyClass = "text-red-400";
  } else if (occupancyRate >= 70) {
    occupancyClass = "text-yellow-400";
  }

  // Log each location's occupation calculation
  console.log(`Location ${location.name}: occupied=${occupied}, capacity=${capacity}, rate=${occupancyRate}%`);

  return (
    <TableRow className="border-b border-[#333]">
      <TableCell className="font-medium text-white">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-white" />
          {location.name}
        </div>
      </TableCell>
      <TableCell className="text-gray-300">{location.address}</TableCell>
      <TableCell className="text-gray-300">{location.surface} m²</TableCell>
      <TableCell className="text-gray-300">{capacity} unités</TableCell>
      <TableCell>
        <div className={occupancyClass}>
          {occupancyRate}% ({occupied}/{capacity})
        </div>
        <div className="w-full bg-gray-700/30 rounded-full h-2 mt-1">
          <div 
            className={cn(
              "rounded-full h-2 transition-all duration-500",
              {
                'bg-gradient-to-r from-red-500 to-red-600': occupancyRate >= 90,
                'bg-gradient-to-r from-yellow-500 to-orange-500': occupancyRate >= 70 && occupancyRate < 90,
                'bg-gradient-to-r from-blue-500 to-purple-500': occupancyRate < 70
              }
            )}
            style={{ 
              width: `${Math.min(occupancyRate, 100)}%`
            }}
          />
        </div>
      </TableCell>
      <TableCell className="text-gray-300">{location.manager}</TableCell>
      <TableCell>
        <Badge 
          className="bg-[#8A85FF] hover:bg-[#7A75EF] text-white border-0"
        >
          {location.status === 'Actif' ? 'Actif' : location.status}
        </Badge>
      </TableCell>
      {(onEdit || onDelete) && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(location)}
                className="hover:bg-purple-500/10"
              >
                <Edit className="h-4 w-4 text-gray-300" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(location)}
                className="hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 text-gray-300" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
