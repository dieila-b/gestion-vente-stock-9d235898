
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Warehouse, Store, Trash2, Pencil } from "lucide-react";
import { Transfer } from "@/types/transfer";
import { format } from "date-fns";

interface TransferListProps {
  transfers: Transfer[];
  onEdit: (transfer: Transfer) => void;
  onDelete: (transferId: string) => void;
}

export const TransferList = ({ transfers, onEdit, onDelete }: TransferListProps) => {
  const getTransferQuantity = (transfer: Transfer) => {
    return transfer.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  };

  const getTransferItems = (transfer: Transfer) => {
    return transfer.items
      ?.map(item => item.product?.name)
      .filter(Boolean)
      .join(", ") || "";
  };

  const getTransferTypeLabel = (transfer: Transfer) => {
    switch (transfer.transfer_type) {
      case "depot_to_pos":
        return "Dépôt → Point de vente";
      case "pos_to_depot":
        return "Point de vente → Dépôt";
      case "depot_to_depot":
        return "Dépôt → Dépôt";
      default:
        return "Type inconnu";
    }
  };

  const getTransferTypeIcon = (transfer: Transfer) => {
    switch (transfer.transfer_type) {
      case "depot_to_pos":
      case "pos_to_depot":
        return <Store className="w-4 h-4" />;
      case "depot_to_depot":
        return <Warehouse className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSourceName = (transfer: Transfer) => {
    switch (transfer.transfer_type) {
      case "depot_to_pos":
      case "depot_to_depot":
        return transfer.source_warehouse?.name;
      case "pos_to_depot":
        return transfer.source_pos?.name;
      default:
        return "N/A";
    }
  };

  const getDestinationName = (transfer: Transfer) => {
    switch (transfer.transfer_type) {
      case "depot_to_pos":
        return transfer.destination_pos?.name;
      case "pos_to_depot":
      case "depot_to_depot":
        return transfer.destination_warehouse?.name;
      default:
        return "N/A";
    }
  };

  return (
    <div className="relative overflow-x-auto rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10">
            <TableHead className="text-white">Référence</TableHead>
            <TableHead className="text-white">Date</TableHead>
            <TableHead className="text-white">Type</TableHead>
            <TableHead className="text-white">Source</TableHead>
            <TableHead className="text-white">Destination</TableHead>
            <TableHead className="text-white">Article(s)</TableHead>
            <TableHead className="text-white">Quantité</TableHead>
            <TableHead className="text-white">Statut</TableHead>
            <TableHead className="text-white">Notes</TableHead>
            <TableHead className="text-white text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((transfer) => (
            <TableRow
              key={transfer.id}
              className="border-b border-white/5 hover:bg-white/5"
            >
              <TableCell className="font-medium">{transfer.reference}</TableCell>
              <TableCell>{format(new Date(transfer.transfer_date), "dd/MM/yyyy")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTransferTypeIcon(transfer)}
                  <span>{getTransferTypeLabel(transfer)}</span>
                </div>
              </TableCell>
              <TableCell>{getSourceName(transfer)}</TableCell>
              <TableCell>{getDestinationName(transfer)}</TableCell>
              <TableCell>{getTransferItems(transfer)}</TableCell>
              <TableCell>{getTransferQuantity(transfer)}</TableCell>
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
              <TableCell>{transfer.notes}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
