
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { CatalogProduct } from "@/types/catalog";
import { formatGNF } from "@/lib/currency";

interface QuoteProductsProps {
  products: Array<{
    product: CatalogProduct;
    quantity: number;
  }>;
  onQuantityChange: (index: number, quantity: number) => void;
  onProductRemove: (index: number) => void;
  onAddProduct: () => void;
}

export function QuoteProducts({ products, onQuantityChange, onProductRemove, onAddProduct }: QuoteProductsProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-muted-foreground">Produits</label>
        <Button
          type="button"
          variant="outline"
          onClick={onAddProduct}
          className="enhanced-glass"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>
      <div className="space-y-2">
        {products.map((item, index) => (
          <div key={index} className="enhanced-glass p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">{formatGNF(item.product.price)}</p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => onQuantityChange(index, Number(e.target.value))}
                className="w-20 enhanced-glass"
                min="1"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => onProductRemove(index)}
                className="enhanced-glass"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
