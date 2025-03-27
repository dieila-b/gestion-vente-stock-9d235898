
import { useState } from "react";

export function useInvoiceSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const filterInvoices = (invoices?: any[]) => {
    if (!invoices) return [];
    
    return invoices.filter(invoice => {
      const searchString = searchTerm.toLowerCase();
      return (
        invoice.client?.company_name?.toLowerCase().includes(searchString) ||
        invoice.id.toLowerCase().includes(searchString) ||
        invoice.final_total?.toString().includes(searchString)
      );
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    filterInvoices
  };
}
