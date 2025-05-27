
import React from 'react';
import { Button } from "@/components/ui/button";

interface TransfersPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const TransfersPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}: TransfersPaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10">
      <div className="text-sm text-gray-400">
        Affichage de {startItem} à {endItem} sur {totalItems} transfert{totalItems !== 1 ? 's' : ''}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          Précédent
        </Button>
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className={`h-8 w-8 p-0 ${
                  currentPage === pageNumber 
                    ? "bg-purple-600/20 text-purple-300 border-purple-500/30" 
                    : "border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};
