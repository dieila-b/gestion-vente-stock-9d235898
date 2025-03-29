
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
              {(onEdit || onDelete) && <TableHead className="text-right text-gray-300">Actions</TableHead>}
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
                const occupancyRate = (location.occupied / location.capacity) * 100;
                const occupancyText = `${occupancyRate.toFixed(0)}% (${location.occupied}/${location.capacity})`;

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
                    <TableCell className="text-gray-300">{location.capacity} unités</TableCell>
                    <TableCell>
                      <div className="text-gray-300">
                        {occupancyText}
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
                    {onEdit && (
                      <TableCell className="text-right">
                        <button
                          onClick={() => onEdit(location)}
                          className="text-[#8A85FF] hover:text-[#7A75EF] text-sm font-medium"
                        >
                          Modifier
                        </button>
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
  );
}
