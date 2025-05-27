
import { Card } from "@/components/ui/card";
import { SearchTransfer } from "@/components/transfers/SearchTransfer";
import { TransfersTable } from "@/components/transfers/components/TransfersTable";
import { TransfersPagination } from "@/components/transfers/components/TransfersPagination";
import { Transfer } from "@/types/transfer";
import { useState, useMemo } from "react";

interface TransfersContentProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredTransfers: Transfer[];
  onEdit: (transfer: Transfer) => void;
  onDelete: (transferId: string) => void;
}

export const TransfersContent = ({
  searchQuery,
  onSearchChange,
  filteredTransfers,
  onEdit,
  onDelete
}: TransfersContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalItems = filteredTransfers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedTransfers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTransfers.slice(startIndex, endIndex);
  }, [filteredTransfers, currentPage, itemsPerPage]);

  // Reset to first page when search changes
  const handleSearchChange = (query: string) => {
    setCurrentPage(1);
    onSearchChange(query);
  };

  return (
    <Card className="enhanced-glass">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Liste des Transferts
        </h2>
        <SearchTransfer 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
      </div>

      <div className="overflow-hidden">
        <TransfersTable
          transfers={paginatedTransfers}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        
        {totalPages > 1 && (
          <TransfersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </Card>
  );
};
