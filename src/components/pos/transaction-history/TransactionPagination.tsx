
import { Button } from "@/components/ui/button";

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function TransactionPagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  onPageChange 
}: TransactionPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        {totalItems} transaction{totalItems !== 1 ? 's' : ''}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </Button>
        <div className="text-sm">
          Page {currentPage} sur {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
