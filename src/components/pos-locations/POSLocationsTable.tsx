
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { POSLocation } from "@/types/pos-locations";

interface POSLocationsTableProps {
  locations: POSLocation[];
  onEdit: (location: POSLocation) => void;
  onDelete: (location: POSLocation) => void;
}

export function POSLocationsTable({ locations, onEdit, onDelete }: POSLocationsTableProps) {
  if (!locations || locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">Aucun dépôt PDV trouvé</p>
        <p className="text-sm text-muted-foreground">Ajoutez un nouveau dépôt PDV pour commencer</p>
      </div>
    );
  }

  return (
    <div className="rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-800">
            <TableHead>Nom</TableHead>
            <TableHead>Localisation</TableHead>
            <TableHead>Surface</TableHead>
            <TableHead>Capacité</TableHead>
            <TableHead>Occupation</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => {
            // Calculer le taux d'occupation
            const occupationRate = location.capacity > 0 
              ? Math.round((location.occupied / location.capacity) * 100) 
              : 0;
            
            return (
              <TableRow key={location.id} className="border-b border-slate-700">
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>{location.address}</TableCell>
                <TableCell>{location.surface} m²</TableCell>
                <TableCell>{location.capacity}</TableCell>
                <TableCell>{occupationRate}%</TableCell>
                <TableCell>{location.manager}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    location.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {location.is_active ? "Actif" : "Inactif"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(location)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(location)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
