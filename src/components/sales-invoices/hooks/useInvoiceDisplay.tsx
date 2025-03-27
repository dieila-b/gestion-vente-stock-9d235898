
import { useInvoiceDialog } from "./dialog/useInvoiceDialog";
import { useInvoiceEdit } from "./editing/useInvoiceEdit";
import { useInvoiceFormat } from "./formatting/useInvoiceFormat";

export function useInvoiceDisplay() {
  const {
    showInvoiceDialog,
    setShowInvoiceDialog,
    selectedInvoice,
    setSelectedInvoice,
    handleViewInvoice
  } = useInvoiceDialog();

  const { handleEditInvoice } = useInvoiceEdit();
  const { getItemsSummary, formatInvoiceItems } = useInvoiceFormat();

  // This is a placeholder function that will be provided by the parent component
  const handlePayment = (invoice: any) => {
    // Actual implementation is in useInvoicePayment
  };

  return {
    showInvoiceDialog,
    setShowInvoiceDialog,
    selectedInvoice,
    setSelectedInvoice,
    handleEditInvoice,
    handleViewInvoice,
    getItemsSummary,
    formatInvoiceItems,
    handlePayment
  };
}
