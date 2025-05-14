
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";
import { StockEntryDialog } from "./StockEntryDialog";

interface StockEntryFormProps {
  warehouses: { id: string; name: string; }[];
  products: { id: string; name: string; reference?: string; price: number; }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
}

export function StockEntryForm({ warehouses, products, onSubmit }: StockEntryFormProps) {
  return (
    <StockEntryDialog 
      warehouses={warehouses}
      products={products}
      onSubmit={onSubmit}
    />
  );
}
