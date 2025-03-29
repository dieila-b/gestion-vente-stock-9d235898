
import { StockItemsTable } from "./stock-table/StockItemsTable";

interface StockItem {
  id: string;
  product?: {
    reference?: string;
    name?: string;
    category?: string;
  };
  warehouse?: {
    id?: string;
    name: string;
  };
  quantity: number;
  unit_price: number;
  total_value: number;
}

interface StockItemsListTableProps {
  items: StockItem[];
  isLoading: boolean;
}

export function StockItemsListTable({ items, isLoading }: StockItemsListTableProps) {
  return <StockItemsTable items={items} isLoading={isLoading} />;
}
