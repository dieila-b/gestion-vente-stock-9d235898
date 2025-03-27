
import { useState } from "react";

export type SortColumn = 'id' | 'client' | 'total_amount' | 'paid_amount' | 'remaining_amount' | 'status' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export function useSorting() {
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
