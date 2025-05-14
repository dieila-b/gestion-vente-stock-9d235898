
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Warehouse, Store, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";

interface TransferListProps {
  transfers: any[];
  onEdit: (transfer: any) => void;
  onDelete: (transferId: string) => void;
}

export const TransferList = ({ transfers, onEdit, onDelete }: TransferListProps) => {
  return (
    <div className="relative overflow-x-auto rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10">
            <TableHead className="text-white">Date</TableHead>
            <TableHead className="text-white">De</TableHead>
            <TableHead className="text-white">Vers</TableHead>
            <TableHead className="text-white">Produit</TableHead>
            <TableHead className="text-white">Quantité</TableHead>
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
                <TableCell>{format(new Date(transfer.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell>{transfer.source_warehouse?.name || 'N/A'}</TableCell>
                <TableCell>{transfer.destination_warehouse?.name || 'N/A'}</TableCell>
                <TableCell>{transfer.product?.name || 'N/A'}</TableCell>
                <TableCell>{transfer.quantity}</TableCell>
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
