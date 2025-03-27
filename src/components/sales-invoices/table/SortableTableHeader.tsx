
import { ArrowDownUp } from "lucide-react";
import { SortColumn, SortDirection } from "../hooks/useInvoiceSorting";

interface SortableTableHeaderProps {
  column: SortColumn;
  label: string;
  sortColumn: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
}

export function SortableTableHeader({ 
  column, 
  label, 
  sortColumn, 
  direction, 
  onSort 
}: SortableTableHeaderProps) {
  return (
    <th 
      className="text-left p-4 cursor-pointer hover:bg-white/10"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-2">
        {label}
        <SortIcon column={column} sortColumn={sortColumn} />
      </div>
    </th>
  );
}

function SortIcon({ column, sortColumn }: { column: SortColumn; sortColumn: SortColumn }) {
  if (sortColumn !== column) return <ArrowDownUp className="w-4 h-4 opacity-30" />;
  return <ArrowDownUp className="w-4 h-4" />;
}
