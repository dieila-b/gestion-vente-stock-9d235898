
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle } from "lucide-react";
import { StockEntryForm as StockEntryFormType } from "@/hooks/stocks/useStockMovementTypes";
import { StockOutFormContent } from "./StockOutFormContent";

interface StockOutDialogProps {
  warehouses: { id: string; name: string; }[];
  posLocations?: { id: string; name: string; }[];
  products: { id: string; name: string; reference?: string; price: number; }[];
  onSubmit: (data: StockEntryFormType) => Promise<boolean>;
}

export function StockOutDialog({ warehouses, posLocations = [], products, onSubmit }: StockOutDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSubmitSuccess = () => {
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ArrowDownCircle className="h-4 w-4" />
          <span>Nouvelle sortie</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
            Nouvelle sortie de stock
          </DialogTitle>
        </DialogHeader>
        
        <StockOutFormContent 
          warehouses={warehouses} 
          posLocations={posLocations}
          products={products} 
          onSubmit={onSubmit}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
