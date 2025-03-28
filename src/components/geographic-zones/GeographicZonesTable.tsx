
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GeographicZone } from "@/types/geographic";
import { Edit, Trash2 } from "lucide-react";

interface GeographicZonesTableProps {
  zones: GeographicZone[] | undefined;
  onEdit: (zone: GeographicZone) => void;
  onDelete: (zone: GeographicZone) => void;
  getZoneTypeName: (type: GeographicZone["type"]) => string;
  getParentName: (parentId: string | undefined) => string;
}

export function GeographicZonesTable({
  zones,
  onEdit,
  onDelete,
  getZoneTypeName,
  getParentName,
}: GeographicZonesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Zone parent</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {zones?.map((zone) => (
          <TableRow key={zone.id}>
            <TableCell className="font-medium">{zone.name}</TableCell>
            <TableCell>{getZoneTypeName(zone.type)}</TableCell>
            <TableCell>{getParentName(zone.parent_id)}</TableCell>
            <TableCell>{zone.description || "-"}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(zone)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(zone)}
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
