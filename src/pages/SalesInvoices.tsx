
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { SalesInvoicesHeader } from "@/components/sales-invoices/SalesInvoicesHeader";
import { SalesInvoicesTable } from "@/components/sales-invoices/SalesInvoicesTable";
import { SalesInvoiceDialog } from "@/components/sales-invoices/SalesInvoiceDialog";
import { useSalesInvoices } from "@/components/sales-invoices/hooks/useSalesInvoices";
import { useInvoicePrinter } from "@/components/sales-invoices/hooks/printing/useInvoicePrinter";
import { SalesInvoicePagination } from "@/components/sales-invoices/table/SalesInvoicePagination";

export default function SalesInvoices() {
  const {
    showUnpaidOnly,
    paginatedInvoices,
    isLoading,
    sortColumn,
    sortDirection,
    searchTerm,
    setSearchTerm,
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    selectedInvoice,
    setSelectedInvoice,
    showInvoiceDialog,
    setShowInvoiceDialog,
    handleSort,
    handlePayment,
    handleDeliveryUpdate,
    handleSubmitPayment,
    handleEditInvoice,
    handleViewInvoice,
    getItemsSummary,
    formatInvoiceItems,
    showDeliveryTabByDefault,
    showPaymentTabByDefault,
    fullyDeliveredByDefault,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages
  } = useSalesInvoices();

  const { handlePrint } = useInvoicePrinter();

  return (
    <div className="p-6 space-y-6">
      <SalesInvoicesHeader
        showUnpaidOnly={showUnpaidOnly}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <SalesInvoicesTable
        invoices={paginatedInvoices || []}
        isLoading={isLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        handleSort={handleSort}
        handleViewInvoice={handleViewInvoice}
        handleEditInvoice={handleEditInvoice}
        handlePayment={handlePayment}
        handleDeliveryUpdate={handleDeliveryUpdate}
        getItemsSummary={getItemsSummary}
      />

      <SalesInvoicePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {selectedInvoice && (
        <>
          <PaymentDialog
            isOpen={isPaymentDialogOpen}
            onClose={() => {
              setIsPaymentDialogOpen(false);
            }}
            totalAmount={selectedInvoice.remaining_amount}
            onSubmitPayment={handleSubmitPayment}
            items={selectedInvoice.items?.map(item => ({
              id: item.id,
              name: item.product?.name || `Produit #${item.product_id}`,
              quantity: item.quantity
            }))}
            isAlreadyPaid={selectedInvoice.payment_status === 'paid'}
            showDeliveryTabByDefault={showDeliveryTabByDefault}
            showPaymentTabByDefault={showPaymentTabByDefault}
            fullyDeliveredByDefault={fullyDeliveredByDefault}
          />

          <SalesInvoiceDialog
            showInvoiceDialog={showInvoiceDialog}
            setShowInvoiceDialog={setShowInvoiceDialog}
            selectedInvoice={selectedInvoice}
            handlePrint={() => handlePrint(selectedInvoice)}
            formatInvoiceItems={formatInvoiceItems}
          />
        </>
      )}
    </div>
  );
}
