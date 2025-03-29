
import { TableHeader, TableHead, TableRow } from "@/components/ui/table";

interface POSLocationsTableHeaderProps {
  hasActions: boolean;
}

export function POSLocationsTableHeader({ hasActions }: POSLocationsTableHeaderProps) {
  return (
    <TableHeader className="bg-black/40">
      <TableRow className="border-b border-[#333]">
        <TableHead className="text-gray-300">Nom</TableHead>
        <TableHead className="text-gray-300">Adresse</TableHead>
        <TableHead className="text-gray-300">Surface</TableHead>
        <TableHead className="text-gray-300">Capacité</TableHead>
        <TableHead className="text-gray-300">Occupation</TableHead>
        <TableHead className="text-gray-300">Responsable</TableHead>
        <TableHead className="text-gray-300">Statut</TableHead>
      </TableRow>
    </TableHeader>
  );
}
