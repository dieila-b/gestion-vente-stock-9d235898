
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { formatGNF } from "@/lib/currency";

interface UnpaidInvoice {
  id: string;
  created_at: string;
  client?: { 
    id?: string;
    company_name?: string;
    contact_name?: string;
  };
  client_id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface UnpaidInvoicesTableProps {
  invoices: UnpaidInvoice[];
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}

export function UnpaidInvoicesTable({ invoices, sortConfig, onSort }: UnpaidInvoicesTableProps) {
  const getClientDisplayName = (invoice: UnpaidInvoice) => {
    if (invoice.client?.contact_name) {
      return invoice.client.contact_name;
    }
    return "Client particulier";
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Détail des factures</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => onSort('created_at')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                Date
                <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
              </TableHead>
              <TableHead onClick={() => onSort('client')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                Client
                <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
              </TableHead>
              <TableHead>N° Facture</TableHead>
              <TableHead className="text-right" onClick={() => onSort('amount')}>
                Total
                <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
              </TableHead>
              <TableHead className="text-right">Payé</TableHead>
              <TableHead onClick={() => onSort('remaining_amount')} className="text-right cursor-pointer hover:bg-accent hover:text-accent-foreground">
                Reste
                <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
              </TableHead>
              <TableHead onClick={() => onSort('payment_status')} className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                Statut
                <ArrowUpDown className="h-4 w-4 inline-block ml-2" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{new Date(invoice.created_at).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>{getClientDisplayName(invoice)}</TableCell>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell className="text-right">{formatGNF(invoice.amount)}</TableCell>
                <TableCell className="text-right text-green-500">
                  {formatGNF(invoice.paid_amount)}
                </TableCell>
                <TableCell className="text-right text-yellow-500">
                  {formatGNF(invoice.remaining_amount)}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.payment_status === 'partial'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {invoice.payment_status === 'partial' ? 'Partiel' : 'En attente'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {(!invoices || invoices.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Aucune facture impayée trouvée pour cette période
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
