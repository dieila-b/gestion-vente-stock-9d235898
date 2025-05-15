
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StockEntryForm } from "./StockEntryForm";
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";

interface StockEntryDialogContentProps {
  warehouses: { id: string; name: string; }[];
  products: { id: string; name: string; reference?: string; price: number; }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
  onSubmitSuccess: () => void;
}

export function StockEntryDialogContent({
  warehouses,
  products,
  onSubmit,
  onSubmitSuccess
}: StockEntryDialogContentProps) {
  return (
    <>
      <StockEntryForm 
        warehouses={warehouses} 
        products={products} 
        onSubmit={onSubmit}
        onSuccess={onSubmitSuccess}
      />
      
      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button variant="outline" type="button">Annuler</Button>
        </DialogClose>
        <Button type="submit" form="stock-entry-form">Enregistrer</Button>
      </DialogFooter>
    </>
  );
}
