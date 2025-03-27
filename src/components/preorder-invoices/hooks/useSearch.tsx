
import { useState } from "react";

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState('');

  const filterInvoices = (invoices: any[] | undefined) => {
    if (!invoices) return [];
    
    return invoices.filter(invoice => {
      const searchString = searchTerm.toLowerCase();
      return (
        invoice.client?.company_name?.toLowerCase().includes(searchString) ||
        invoice.id.toLowerCase().includes(searchString) ||
        invoice.total_amount?.toString().includes(searchString)
      );
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    filterInvoices
  };
}
