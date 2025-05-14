
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Warehouse, Store, Trash2, Pencil } from "lucide-react";
import { Transfer } from "@/types/transfer";
import { safeFormatDate } from "@/utils/date-utils";

interface TransferListProps {
  transfers: Transfer[];
  onEdit: (transfer: Transfer) => void;
  onDelete: (transferId: string) => void;
}

export const TransferList = ({ transfers, onEdit, onDelete }: TransferListProps) => {
  // Helper function to get source name based on transfer type
  const getSourceName = (transfer: Transfer): string => {
    if (transfer.transfer_type === "depot_to_pos") {
      return transfer.source_warehouse?.name || "N/A";
    } else if (transfer.transfer_type === "pos_to_depot") {
      return transfer.source_pos?.name || "N/A";
    } else {
      return transfer.source_warehouse?.name || "N/A";
    }
  };

  // Helper function to get destination name based on transfer type
  const getDestinationName = (transfer: Transfer): string => {
    if (transfer.transfer_type === "depot_to_pos") {
      return transfer.destination_pos?.name || "N/A";
    } else if (transfer.transfer_type === "pos_to_depot") {
      return transfer.destination_warehouse?.name || "N/A";
    } else {
      return transfer.destination_warehouse?.name || "N/A";
    }
  };

  return (
    <div className="relative overflow-x-auto rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10">
            <TableHead className="text-white">Référence</TableHead>
            <TableHead className="text-white">Date</TableHead>
            <TableHead className="text-white">De</TableHead>
            <TableHead className="text-white">Vers</TableHead>
            <TableHead className="text-white">Statut</TableHead>
            <TableHead className="text-white text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Warehouse className="h-10 w-10 mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun transfert trouvé</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            transfers.map((transfer) => (
              <TableRow
                key={transfer.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <TableCell>{transfer.reference || `Transfer-${transfer.id.slice(0, 8)}`}</TableCell>
                <TableCell>{safeFormatDate(transfer.transfer_date || transfer.created_at)}</TableCell>
                <TableCell>{getSourceName(transfer)}</TableCell>
                <TableCell>{getDestinationName(transfer)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transfer.status === "completed" ? "bg-green-500/20 text-green-500" :
                    transfer.status === "cancelled" ? "bg-red-500/20 text-red-500" :
                    "bg-yellow-500/20 text-yellow-500"
                  }`}>
                    {transfer.status === "completed" ? "Terminé" :
                     transfer.status === "cancelled" ? "Annulé" :
                     "En attente"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(transfer)}
                      className="h-8 w-8 hover:bg-blue-500/20"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(transfer.id)}
                      className="h-8 w-8 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
