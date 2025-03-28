
import { Search } from "lucide-react";
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
  return (
    <Card className="enhanced-glass p-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gradient">Liste des PDV</h2>
          {setSearchQuery && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher un PDV..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-effect w-full md:w-60 lg:w-72"
              />
            </div>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Surface</TableHead>
                <TableHead>Capacité</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Statut</TableHead>
                {(onEdit || onDelete) && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {posLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={onEdit || onDelete ? 8 : 7} className="text-center py-10">
                    Aucun PDV trouvé
                  </TableCell>
                </TableRow>
              ) : (
                posLocations.map((location) => {
                  const occupancyRate = (location.occupied / location.capacity) * 100;
                  const isNearCapacity = occupancyRate >= 90;
                  const isOverCapacity = occupancyRate > 100;

                  return (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          {location.name}
                        </div>
                      </TableCell>
                      <TableCell>{location.address}</TableCell>
                      <TableCell>{location.surface} m²</TableCell>
                      <TableCell>{location.capacity} unités</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              {Math.round(occupancyRate)}% ({location.occupied}/{location.capacity})
                            </span>
                          </div>
                          <div className="w-full bg-gray-700/30 rounded-full h-2.5">
                            <div 
                              className={cn(
                                "rounded-full h-2.5 transition-all duration-500",
                                {
                                  'bg-gradient-to-r from-red-500 to-red-600': isOverCapacity,
                                  'bg-gradient-to-r from-yellow-500 to-orange-500': isNearCapacity && !isOverCapacity,
                                  'bg-gradient-to-r from-blue-500 to-purple-500': !isNearCapacity
                                }
                              )}
                              style={{ 
                                width: `${Math.min(occupancyRate, 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{location.manager}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={location.status === 'Actif' ? 'default' : 'secondary'}
                        >
                          {location.status}
                        </Badge>
                      </TableCell>
                      {(onEdit || onDelete) && (
                        <TableCell className="text-right space-x-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(location)}
                              className="px-2 py-1 text-xs rounded-md bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                            >
                              Modifier
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(location)}
                              className="px-2 py-1 text-xs rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                              Supprimer
                            </button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
