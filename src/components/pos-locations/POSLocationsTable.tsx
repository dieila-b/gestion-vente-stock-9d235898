
import { Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { POSLocation } from "@/types/pos-locations";
import { Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-[#8A85FF]">Liste des PDV</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Rechercher un PDV..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1E1E1E] border-[#333] w-full md:w-60 lg:w-72"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border border-[#333] overflow-hidden">
        <Table>
          <TableHeader className="bg-black/40">
            <TableRow className="border-b border-[#333]">
              <TableHead className="text-gray-300">Nom</TableHead>
              <TableHead className="text-gray-300">Adresse</TableHead>
              <TableHead className="text-gray-300">Surface</TableHead>
              <TableHead className="text-gray-300">Capacité</TableHead>
              <TableHead className="text-gray-300">Occupation</TableHead>
              <TableHead className="text-gray-300">Responsable</TableHead>
              <TableHead className="text-gray-300">Statut</TableHead>
              {(onEdit || onDelete) && (
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-black/20">
            {posLocations.length === 0 ? (
              <TableRow className="border-b border-[#333]">
                <TableCell colSpan={onEdit || onDelete ? 8 : 7} className="text-center py-10 text-gray-400">
                  Aucun PDV trouvé
                </TableCell>
              </TableRow>
            ) : (
              posLocations.map((location) => {
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
                  <TableRow key={location.id} className="border-b border-[#333]">
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
                              onClick={() => handleDeleteClick(location)}
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
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le PDV "{locationToDelete?.name}" ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
