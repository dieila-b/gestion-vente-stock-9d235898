
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ClientReportPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (items: number) => void;
}

export function ClientReportPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  handlePageChange,
  handleItemsPerPageChange
}: ClientReportPaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Afficher</span>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => handleItemsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">par page</span>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNumber = i + 1;
            
            if (totalPages > 5 && currentPage > 3) {
              pageNumber = currentPage - 3 + i;
            }
            
            if (pageNumber <= totalPages) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === currentPage}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <div className="text-sm text-muted-foreground">
        Page {currentPage} sur {totalPages || 1}
      </div>
    </div>
  );
}
