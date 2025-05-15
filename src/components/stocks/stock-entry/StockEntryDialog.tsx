
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
    // Force close the dialog with a timeout to ensure state updates properly
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };
  
  const handleSubmit = async (data: StockEntryFormType): Promise<boolean> => {
    console.log("StockEntryDialog - handleSubmit called with data:", data);
    try {
      const success = await onSubmit(data);
      
      if (success) {
        console.log("Stock entry submission successful");
        // Note: We'll let the success callback handle dialog closing
        return true;
      } else {
        console.error("Stock entry submission failed");
        return false;
      }
    } catch (error) {
      console.error("Error in StockEntryDialog handleSubmit:", error);
      return false;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          onSubmit={handleSubmit}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
