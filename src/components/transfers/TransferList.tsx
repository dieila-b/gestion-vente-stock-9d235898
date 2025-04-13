
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
            <TableHead className="text-white hidden md:table-cell">Date</TableHead>
            <TableHead className="text-white">Type</TableHead>
            <TableHead className="text-white hidden lg:table-cell">Source</TableHead>
            <TableHead className="text-white hidden lg:table-cell">Destination</TableHead>
            <TableHead className="text-white hidden xl:table-cell">Article(s)</TableHead>
            <TableHead className="text-white hidden sm:table-cell">Quantité</TableHead>
            <TableHead className="text-white">Statut</TableHead>
            <TableHead className="text-white hidden xl:table-cell">Notes</TableHead>
            <TableHead className="text-white text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-32 text-center">
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
                <TableCell className="font-medium">{transfer.reference}</TableCell>
                <TableCell className="hidden md:table-cell">{format(new Date(transfer.transfer_date), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTransferTypeIcon(transfer)}
                    <span className="hidden sm:inline">{getTransferTypeLabel(transfer)}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{getSourceName(transfer)}</TableCell>
                <TableCell className="hidden lg:table-cell">{getDestinationName(transfer)}</TableCell>
                <TableCell className="hidden xl:table-cell max-w-xs truncate">{getTransferItems(transfer)}</TableCell>
                <TableCell className="hidden sm:table-cell">{getTransferQuantity(transfer)}</TableCell>
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
                <TableCell className="hidden xl:table-cell max-w-xs truncate">{transfer.notes}</TableCell>
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
