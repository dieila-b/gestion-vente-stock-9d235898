
import { useState } from "react";

export type SortColumn = 'id' | 'client' | 'final_total' | 'paid_amount' | 'remaining_amount' | 'payment_status' | 'created_at' | 'delivery_status';
export type SortDirection = 'asc' | 'desc';

export function useInvoiceSorting() {
  const [sortColumn, setSortColumn] = useState<SortColumn>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return {
    sortColumn,
    sortDirection,
    handleSort
  };
}
