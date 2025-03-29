
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatGNF } from "@/lib/currency";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortField = 'date' | 'order_id' | 'total' | 'paid' | 'remaining' | null;
type SortDirection = 'asc' | 'desc';

interface ClientInvoice {
  id: string;
  created_at: string;
  final_total: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: string;
  items: Array<{
    id: string;
    quantity?: number;
    price?: number;
    total?: number;
    discount?: number;
    products?: {
      name?: string;
    };
  }>;
}

interface ClientInvoicesTableProps {
  invoices: ClientInvoice[];
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
  selectedClient: string;
}

export function ClientInvoicesTable({ 
  invoices, 
  sortField, 
  sortDirection, 
  handleSort, 
  selectedClient 
}: ClientInvoicesTableProps) {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="inline ml-1 h-4 w-4" /> : 
      <ChevronDown className="inline ml-1 h-4 w-4" />;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Détail des factures</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Date {renderSortIcon('date')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('order_id')}
              >
                N° Facture {renderSortIcon('order_id')}
              </TableHead>
              <TableHead>Articles</TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('total')}
              >
                Total {renderSortIcon('total')}
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('paid')}
              >
                Payé {renderSortIcon('paid')}
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => handleSort('remaining')}
              >
                Reste {renderSortIcon('remaining')}
              </TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices?.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{new Date(invoice.created_at).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>{"FACT-" + invoice.id.slice(0, 8)}</TableCell>
                <TableCell>
                  {invoice.items.length}
                </TableCell>
                <TableCell className="text-right">{formatGNF(invoice.final_total)}</TableCell>
                <TableCell className="text-right text-green-500">
                  {formatGNF(invoice.paid_amount)}
                </TableCell>
                <TableCell className="text-right text-yellow-500">
                  {formatGNF(invoice.remaining_amount)}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.payment_status === 'paid' 
                      ? 'bg-green-500/10 text-green-500'
                      : invoice.payment_status === 'partial'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {invoice.payment_status === 'paid' 
                      ? 'Payé'
                      : invoice.payment_status === 'partial'
                      ? 'Partiel'
                      : 'En attente'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {(!invoices || invoices.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {selectedClient ? "Aucune facture trouvée pour ce client sur cette période" : "Veuillez sélectionner un client"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
