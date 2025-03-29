
import { TableHeader, TableHead, TableRow } from "@/components/ui/table";

interface WarehouseTableHeaderProps {
  hasActions: boolean;
}

export function WarehouseTableHeader({ hasActions }: WarehouseTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Entrepôt</TableHead>
        <TableHead>Localisation</TableHead>
        <TableHead>Surface</TableHead>
        <TableHead>Capacité</TableHead>
        <TableHead>Occupation</TableHead>
        <TableHead>Responsable</TableHead>
        <TableHead>Statut</TableHead>
        {hasActions && <TableHead className="text-right">Actions</TableHead>}
      </TableRow>
    </TableHeader>
  );
}
