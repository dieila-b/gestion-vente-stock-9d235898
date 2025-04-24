
import { Button } from "@/components/ui/button";
import { Loader, Plus } from "lucide-react";

interface ProductsHeaderProps {
  itemCount: number;
  onAddProduct: () => void;
  isLoading: boolean;
}

export function ProductsHeader({ itemCount, onAddProduct, isLoading }: ProductsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-white/70">Articles ({itemCount})</h3>
      </div>
      <Button 
        onClick={onAddProduct}
        variant="outline"
        className="neo-blur"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        Ajouter un produit
      </Button>
    </div>
  );
}
