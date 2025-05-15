
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle } from "lucide-react";
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";
import { StockEntryFormContent } from "./StockEntryFormContent";

interface StockEntryDialogProps {
  warehouses: { id: string; name: string; }[];
  products: { id: string; name: string; reference?: string; price: number; }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
}

export function StockEntryDialog({ warehouses, products, onSubmit }: StockEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSubmitSuccess = () => {
    console.log("Stock entry submitted successfully, closing dialog");
    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ArrowUpCircle className="h-4 w-4" />
          <span>Nouvelle entrée</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
            Nouvelle entrée de stock
          </DialogTitle>
        </DialogHeader>
        
        <StockEntryFormContent 
          warehouses={warehouses} 
          products={products} 
          onSubmit={onSubmit}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
