
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
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id}>
              <TableCell className="font-medium">{location.name}</TableCell>
              <TableCell>{location.address}</TableCell>
              <TableCell>{location.manager}</TableCell>
              <TableCell>{location.phone || "—"}</TableCell>
              <TableCell>{location.email || "—"}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  location.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {location.is_active ? "Actif" : "Inactif"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
