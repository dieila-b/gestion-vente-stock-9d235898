
import { Button } from "@/components/ui/button";
import { FileText, Edit, DollarSign, TruckIcon } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { formatDate } from "@/lib/formatters";
import { InvoiceTableHeader } from "./table/InvoiceTableHeader";
import { InvoiceTableRow } from "./table/InvoiceTableRow";
import { EmptyInvoiceState } from "./table/EmptyInvoiceState";
import { SortColumn, SortDirection } from "./hooks/useInvoiceSorting";

interface SalesInvoicesTableProps {
  invoices: any[];
  isLoading: boolean;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  handleSort: (column: SortColumn) => void;
  handleViewInvoice: (invoice: any) => void;
  handleEditInvoice: (invoice: any) => void;
  handlePayment: (invoice: any) => void;
  handleDeliveryUpdate: (invoice: any) => void;
  getItemsSummary: (invoice: any) => string;
}

export function SalesInvoicesTable({
  invoices,
  isLoading,
  sortColumn,
  sortDirection,
  handleSort,
  handleViewInvoice,
  handleEditInvoice,
  handlePayment,
  handleDeliveryUpdate,
  getItemsSummary
}: SalesInvoicesTableProps) {
  
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <table className="w-full text-xs md:text-sm">
        <InvoiceTableHeader 
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          handleSort={handleSort}
        />
        <tbody className="divide-y divide-white/10">
          {isLoading || invoices?.length === 0 ? (
            <EmptyInvoiceState isLoading={isLoading} />
          ) : (
            invoices?.map((invoice) => (
              <InvoiceTableRow
                key={invoice.id}
                invoice={invoice}
                getItemsSummary={getItemsSummary}
                handleViewInvoice={handleViewInvoice}
                handleEditInvoice={handleEditInvoice}
                handlePayment={handlePayment}
                handleDeliveryUpdate={handleDeliveryUpdate}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
