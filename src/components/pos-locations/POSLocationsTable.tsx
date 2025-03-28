
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { POSLocation } from "@/types/pos-locations";

interface POSLocationsTableProps {
  locations: POSLocation[];
  onEdit: (location: POSLocation) => void;
  onDelete: (location: POSLocation) => void;
}

export function POSLocationsTable({ locations, onEdit, onDelete }: POSLocationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Adresse</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {locations?.map((location) => (
          <TableRow key={location.id}>
            <TableCell className="font-medium">{location.name}</TableCell>
            <TableCell>{location.address}</TableCell>
            <TableCell>{location.phone || "-"}</TableCell>
            <TableCell>{location.email || "-"}</TableCell>
            <TableCell>{location.manager || "-"}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded text-xs ${location.status === 'active' || location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {location.status === 'active' || location.is_active ? 'Actif' : 'Inactif'}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(location)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(location)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
