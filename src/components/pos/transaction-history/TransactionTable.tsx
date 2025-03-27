
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatGNF } from "@/lib/currency";

interface Transaction {
  id: string;
  created_at: string;
  total: number;
  discount: number;
  final_total: number;
  status: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionTable({ 
  transactions, 
  isLoading, 
  onEdit, 
  onDelete 
}: TransactionTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>ID Transaction</TableHead>
            <TableHead>Sous-total</TableHead>
            <TableHead>Remise</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Chargement...
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Aucune transaction trouvée
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.created_at), "Pp", { locale: fr })}
                </TableCell>
                <TableCell className="font-mono">{transaction.id}</TableCell>
                <TableCell>{formatGNF(transaction.total)}</TableCell>
                <TableCell>{formatGNF(transaction.discount)}</TableCell>
                <TableCell className="font-semibold">
                  {formatGNF(transaction.final_total)}
                </TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(transaction)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(transaction.id)}
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
}
