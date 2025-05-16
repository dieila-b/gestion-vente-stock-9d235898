
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle } from "lucide-react";
import { StockEntryDialogContent } from "./StockEntryDialogContent";
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";

interface StockEntryDialogProps {
  warehouses: { id: string; name: string }[];
  products: { id: string; name: string; reference?: string; price: number }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
}

export function StockEntryDialog({ warehouses, products, onSubmit }: StockEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmitSuccess = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (data: StockEntryFormType) => {
    const result = await onSubmit(data);
    if (result) {
      handleSubmitSuccess();
    }
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <ArrowUpCircle className="h-4 w-4" />
          Nouvelle entrée
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle entrée de stock</DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle entrée de marchandises dans votre stock.
          </DialogDescription>
        </DialogHeader>
        <StockEntryDialogContent 
          warehouses={warehouses} 
          products={products} 
          onSubmit={handleSubmit}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
