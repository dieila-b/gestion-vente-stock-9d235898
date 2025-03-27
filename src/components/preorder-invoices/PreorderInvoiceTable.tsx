
import { Button } from "@/components/ui/button";
import { FileText, Edit } from "lucide-react";
import { formatGNF } from "@/lib/currency";

type SortColumn = 'id' | 'client' | 'total_amount' | 'paid_amount' | 'remaining_amount' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

interface PreorderInvoiceTableProps {
  invoices: any[];
  isLoading: boolean;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  handleSort: (column: SortColumn) => void;
  handleViewInvoice: (invoice: any) => void;
  handleEditInvoice: (invoice: any) => void;
  handlePayment: (invoice: any) => void;
}

export function PreorderInvoiceTable({
  invoices,
  isLoading,
  sortColumn,
  sortDirection,
  handleSort,
  handleViewInvoice,
  handleEditInvoice,
  handlePayment
}: PreorderInvoiceTableProps) {
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <div className="w-4 h-4 opacity-30">↕</div>;
    return <div className="w-4 h-4">{sortDirection === 'asc' ? '↑' : '↓'}</div>;
  };

  const getItemsSummary = (invoice: any) => {
    if (!invoice.items || invoice.items.length === 0) return "Aucun article";
    
    const firstItem = invoice.items[0];
    const productName = firstItem.product?.name || "Produit inconnu";
    
    if (invoice.items.length === 1) return productName;
    
    return `${productName} + ${invoice.items.length - 1} autres`;
  };
  
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th 
              className="text-left p-4 cursor-pointer hover:bg-white/10"
              onClick={() => handleSort('id')}
            >
              <div className="flex items-center gap-2">
                N° Facture
                <SortIcon column="id" />
              </div>
            </th>
            <th 
              className="text-left p-4 cursor-pointer hover:bg-white/10"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center gap-2">
                Date
                <SortIcon column="created_at" />
              </div>
            </th>
            <th 
              className="text-left p-4 cursor-pointer hover:bg-white/10"
              onClick={() => handleSort('client')}
            >
              <div className="flex items-center gap-2">
                Client
                <SortIcon column="client" />
              </div>
            </th>
            <th className="text-left p-4">
              Article
            </th>
            <th 
              className="text-left p-4 cursor-pointer hover:bg-white/10"
              onClick={() => handleSort('total_amount')}
            >
              <div className="flex items-center gap-2">
                Total
                <SortIcon column="total_amount" />
              </div>
            </th>
            <th 
              className="text-left p-4 cursor-pointer hover:bg-white/10"
              onClick={() => handleSort('paid_amount')}
            >
              <div className="flex items-center gap-2">
                Payé
                <SortIcon column="paid_amount" />
              </div>
            </th>
            <th 
              className="text-left p-4 cursor-pointer hover:bg-white/10"
              onClick={() => handleSort('remaining_amount')}
            >
              <div className="flex items-center gap-2">
                Restant
                <SortIcon column="remaining_amount" />
              </div>
            </th>
            <th 
              className="text-left p-4 cursor-pointer hover:bg-white/10"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-2">
                Statut
                <SortIcon column="status" />
              </div>
            </th>
            <th className="text-left p-4">
              État de livraison
            </th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {isLoading ? (
            <tr>
              <td colSpan={10} className="p-4 text-center">
                Chargement...
              </td>
            </tr>
          ) : invoices?.length === 0 ? (
            <tr>
              <td colSpan={10} className="p-4 text-center">
                Aucune précommande trouvée
              </td>
            </tr>
          ) : (
            invoices?.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-white/5">
                <td className="p-4">
                  {invoice.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="p-4">
                  {new Date(invoice.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  {invoice.client?.company_name || "Client particulier"}
                </td>
                <td className="p-4">
                  {getItemsSummary(invoice)}
                </td>
                <td className="p-4">{formatGNF(invoice.total_amount)}</td>
                <td className="p-4">{formatGNF(invoice.paid_amount)}</td>
                <td className="p-4">{formatGNF(invoice.remaining_amount)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === 'paid' 
                      ? 'bg-green-500/10 text-green-500'
                      : invoice.status === 'partial'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {invoice.status === 'paid' 
                      ? 'Payé'
                      : invoice.status === 'partial'
                      ? 'Partiel'
                      : 'En attente'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === 'available' 
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {invoice.status === 'available' 
                      ? 'Disponible'
                      : 'En attente'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleViewInvoice(invoice)}
                      size="sm"
                      variant="outline"
                      className="bg-white/5 hover:bg-white/10 border-white/10"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleEditInvoice(invoice)}
                      size="sm"
                      variant="outline"
                      className="bg-white/5 hover:bg-white/10 border-white/10"
                      title="Modifier la précommande"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {invoice.status !== 'paid' && (
                      <Button
                        onClick={() => handlePayment(invoice)}
                        size="sm"
                        variant="outline"
                        className="bg-white/5 hover:bg-white/10 border-white/10"
                      >
                        Régler
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
