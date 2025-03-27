
import { useState } from "react";

export function useInvoiceDialog() {
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice({
      ...invoice,
      delivery_status: invoice.delivery_status || 'pending'
    });
    setShowInvoiceDialog(true);
  };

  return {
    showInvoiceDialog,
    setShowInvoiceDialog,
    selectedInvoice,
    setSelectedInvoice,
    handleViewInvoice
  };
}
