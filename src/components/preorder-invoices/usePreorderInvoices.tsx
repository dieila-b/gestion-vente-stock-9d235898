
import { useSearchParams } from "react-router-dom";
import { useSorting } from "./hooks/useSorting";
import { useSearch } from "./hooks/useSearch";
import { useInvoiceDialog } from "./hooks/useInvoiceDialog";
import { usePaymentDialog } from "./hooks/usePaymentDialog";
import { useInvoiceData } from "./hooks/useInvoiceData";

export function usePreorderInvoices() {
  const [searchParams] = useSearchParams();
  const showUnpaidOnly = searchParams.get('filter') === 'unpaid';

  const { sortColumn, sortDirection, handleSort } = useSorting();
  const { searchTerm, setSearchTerm, filterInvoices } = useSearch();
  const { invoices, isLoading, refetch } = useInvoiceData(sortColumn, sortDirection, showUnpaidOnly);
  
  const { 
    showInvoiceDialog, 
    setShowInvoiceDialog, 
    selectedInvoice: invoiceDialogSelectedInvoice, 
    setSelectedInvoice: setInvoiceDialogSelectedInvoice,
    handlePrint 
  } = useInvoiceDialog();
  
  const { 
    isPaymentDialogOpen, 
    setIsPaymentDialogOpen, 
    selectedInvoice: paymentDialogSelectedInvoice,
    setSelectedInvoice: setPaymentDialogSelectedInvoice,
    handleSubmitPayment 
  } = usePaymentDialog(refetch);

  // Combine selected invoice from both dialogs
  const selectedInvoice = invoiceDialogSelectedInvoice || paymentDialogSelectedInvoice;

  // Combined setSelectedInvoice function
  const setSelectedInvoice = (invoice: any) => {
    setInvoiceDialogSelectedInvoice(invoice);
    setPaymentDialogSelectedInvoice(invoice);
  };

  const filteredInvoices = filterInvoices(invoices);

  return {
    invoices: filteredInvoices,
    isLoading,
    sortColumn,
    sortDirection,
    searchTerm,
    setSearchTerm,
    handleSort,
    selectedInvoice,
    setSelectedInvoice,
    showInvoiceDialog,
    setShowInvoiceDialog,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    handleSubmitPayment,
    handlePrint,
    showUnpaidOnly
  };
}
