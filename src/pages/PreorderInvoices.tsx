
import { useNavigate } from "react-router-dom";
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { PreorderInvoiceHeader } from "@/components/preorder-invoices/PreorderInvoiceHeader";
import { PreorderInvoiceTable } from "@/components/preorder-invoices/PreorderInvoiceTable";
import { PreorderInvoiceDialog } from "@/components/preorder-invoices/PreorderInvoiceDialog";
import { usePreorderInvoices } from "@/components/preorder-invoices/usePreorderInvoices";

export default function PreorderInvoices() {
  const navigate = useNavigate();
  const {
    invoices,
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
  } = usePreorderInvoices();

  const handlePayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPaymentDialogOpen(true);
  };

  const handleViewInvoice = (invoice: any) => {
    console.log('Preorder Invoice data:', invoice);
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleEditInvoice = (invoice: any) => {
    console.log('Editing preorder invoice:', invoice.id);
    navigate(`/preorders?edit=${invoice.id}`);
  };

  const navigateToNewPreorder = () => {
    navigate('/preorders');
  };

  return (
    <div className="p-6 space-y-6">
      <PreorderInvoiceHeader 
        showUnpaidOnly={showUnpaidOnly}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        navigateToNewPreorder={navigateToNewPreorder}
      />

      <PreorderInvoiceTable
        invoices={invoices}
        isLoading={isLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        handleSort={handleSort}
        handleViewInvoice={handleViewInvoice}
        handleEditInvoice={handleEditInvoice}
        handlePayment={handlePayment}
      />

      {selectedInvoice && (
        <>
          <PaymentDialog
            isOpen={isPaymentDialogOpen}
            onClose={() => {
              setIsPaymentDialogOpen(false);
              setSelectedInvoice(null);
            }}
            totalAmount={selectedInvoice.remaining_amount}
            onSubmitPayment={handleSubmitPayment}
            items={selectedInvoice.items?.map(item => ({
              id: item.id,
              name: item.product?.name || `Produit #${item.product_id}`,
              quantity: item.quantity
            }))}
          />

          <PreorderInvoiceDialog
            showInvoiceDialog={showInvoiceDialog}
            setShowInvoiceDialog={setShowInvoiceDialog}
            selectedInvoice={selectedInvoice}
            handlePrint={handlePrint}
          />
        </>
      )}
    </div>
  );
}
