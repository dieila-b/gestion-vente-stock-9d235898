
import React from 'react';
import { SortIcon } from './SortIcon';
import { SortColumn, SortDirection } from '../hooks/useInvoiceSorting';

interface InvoiceTableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  handleSort: (column: SortColumn) => void;
}

export function InvoiceTableHeader({ 
  sortColumn, 
  sortDirection, 
  handleSort 
}: InvoiceTableHeaderProps) {
  return (
    <thead className="bg-white/5">
      <tr>
        <th 
          className="text-left p-2 md:p-4 cursor-pointer hover:bg-white/10"
          onClick={() => handleSort('id')}
        >
          <div className="flex items-center gap-2">
            N° Facture
            <SortIcon column="id" currentSortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
        </th>
        <th 
          className="text-left p-2 md:p-4 cursor-pointer hover:bg-white/10"
          onClick={() => handleSort('created_at')}
        >
          <div className="flex items-center gap-2">
            Date
            <SortIcon column="created_at" currentSortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
        </th>
        <th 
          className="text-left p-2 md:p-4 cursor-pointer hover:bg-white/10"
          onClick={() => handleSort('client')}
        >
          <div className="flex items-center gap-2">
            Client
            <SortIcon column="client" currentSortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
        </th>
        <th className="text-left p-2 md:p-4 hidden md:table-cell">
          Articles
        </th>
        <th 
          className="text-left p-2 md:p-4 cursor-pointer hover:bg-white/10"
          onClick={() => handleSort('final_total')}
        >
          <div className="flex items-center gap-2">
            Total
            <SortIcon column="final_total" currentSortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
        </th>
        <th 
          className="text-left p-2 md:p-4 cursor-pointer hover:bg-white/10 hidden md:table-cell"
          onClick={() => handleSort('paid_amount')}
        >
          <div className="flex items-center gap-2">
            Payé
            <SortIcon column="paid_amount" currentSortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
        </th>
        <th 
          className="text-left p-2 md:p-4 cursor-pointer hover:bg-white/10 hidden md:table-cell"
          onClick={() => handleSort('remaining_amount')}
        >
          <div className="flex items-center gap-2">
            Restant
            <SortIcon column="remaining_amount" currentSortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
        </th>
        <th 
          className="text-left p-2 md:p-4 cursor-pointer hover:bg-white/10"
          onClick={() => handleSort('payment_status')}
        >
          <div className="flex items-center gap-2">
            Paiement
            <SortIcon column="payment_status" currentSortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
        </th>
        <th 
          className="text-left p-2 md:p-4 cursor-pointer hover:bg-white/10"
          onClick={() => handleSort('delivery_status')}
        >
          <div className="flex items-center gap-2">
            Livraison
            <SortIcon column="delivery_status" currentSortColumn={sortColumn} sortDirection={sortDirection} />
          </div>
        </th>
        <th className="text-left p-2 md:p-4">Actions</th>
      </tr>
    </thead>
  );
}
