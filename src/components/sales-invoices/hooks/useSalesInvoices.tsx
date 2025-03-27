
import { useState } from "react";
import { useInvoiceSorting } from "./useInvoiceSorting";
import { useInvoiceSearch } from "./useInvoiceSearch";
import { useInvoicePayment } from "./useInvoicePayment";
import { useInvoiceDisplay } from "./useInvoiceDisplay";
import { useInvoiceData } from "./useInvoiceData";

export function useSalesInvoices() {
  // Get sorting functionality
  const { sortColumn, sortDirection, handleSort } = useInvoiceSorting();
  
  // Get invoice data with sorting applied
  const { invoices: allInvoices, isLoading, refetch, showUnpaidOnly } = useInvoiceData(sortColumn, sortDirection);
  
  // Get searching functionality
  const { searchTerm, setSearchTerm, filterInvoices } = useInvoiceSearch();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Get payment functionality
  const { 
    isPaymentDialogOpen, 
    setIsPaymentDialogOpen,
    selectedInvoice: paymentInvoice,
    setSelectedInvoice: setPaymentInvoice,
    handlePayment,
    handleDeliveryUpdate,
    handleSubmitPayment,
    showDeliveryTabByDefault,
    setShowDeliveryTabByDefault,
    showPaymentTabByDefault,
    setShowPaymentTabByDefault,
    fullyDeliveredByDefault,
    setFullyDeliveredByDefault
  } = useInvoicePayment(refetch);
  
  // Get display functionality
  const {
    showInvoiceDialog,
    setShowInvoiceDialog,
    selectedInvoice: displayInvoice,
    setSelectedInvoice: setDisplayInvoice,
    handleEditInvoice: originalHandleEditInvoice,
    handleViewInvoice,
    getItemsSummary,
    formatInvoiceItems
  } = useInvoiceDisplay();

  // Filter invoices based on search term
  const filteredInvoices = filterInvoices(allInvoices);
  
  // Apply pagination to filtered invoices
  const totalPages = Math.ceil(filteredInvoices?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices?.slice(startIndex, startIndex + itemsPerPage);

  return {
    // Sorting
    sortColumn,
    sortDirection,
    handleSort,
    
    // Data
    invoices: filteredInvoices,
    paginatedInvoices,
    isLoading,
    refetch,
    showUnpaidOnly,
    
    // Pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Payment
    isPaymentDialogOpen,
    setIsPaymentDialogOpen,
    selectedInvoice: paymentInvoice || displayInvoice,
    setSelectedInvoice: (invoice: any) => {
      setPaymentInvoice(invoice);
      setDisplayInvoice(invoice);
    },
    handlePayment,
    handleDeliveryUpdate,
    handleSubmitPayment,
    showDeliveryTabByDefault,
    showPaymentTabByDefault,
    fullyDeliveredByDefault,
    
    // Display
    showInvoiceDialog,
    setShowInvoiceDialog,
    handleEditInvoice: originalHandleEditInvoice,
    handleViewInvoice,
    getItemsSummary,
    formatInvoiceItems
  };
}
