
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";
import { StockOutDialog } from "./StockOutDialog";

interface StockOutFormProps {
  warehouses: { id: string; name: string; }[];
  products: { id: string; name: string; reference?: string; price: number; }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
}

export function StockOutForm({ warehouses, products, onSubmit }: StockOutFormProps) {
  return (
    <StockOutDialog 
      warehouses={warehouses}
      products={products}
      onSubmit={onSubmit}
    />
  );
}
