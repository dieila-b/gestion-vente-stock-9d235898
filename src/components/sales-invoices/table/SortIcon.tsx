
import React from 'react';
import { SortColumn, SortDirection } from '../hooks/useInvoiceSorting';

interface SortIconProps {
  column: SortColumn;
  currentSortColumn: SortColumn;
  sortDirection: SortDirection;
}

export function SortIcon({ column, currentSortColumn, sortDirection }: SortIconProps) {
  if (currentSortColumn !== column) {
    return <div className="w-4 h-4 opacity-30">↕</div>;
  }
  
  return <div className="w-4 h-4">{sortDirection === 'asc' ? '↑' : '↓'}</div>;
}
