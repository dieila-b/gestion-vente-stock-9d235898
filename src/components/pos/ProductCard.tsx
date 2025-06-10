
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Plus, AlertCircle } from "lucide-react";
import { Product } from "@/types/pos";
import { formatGNF } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  availableStock?: number;
}

export function ProductCard({ product, onAddToCart, availableStock }: ProductCardProps) {
  // Check if product is out of stock based on available stock first, then product stock
  const effectiveStock = availableStock !== undefined ? availableStock : (product.stock || 0);
  const isOutOfStock = effectiveStock === 0;

  const handleClick = () => {
    if (!isOutOfStock) {
      onAddToCart(product);
    }
  };

  const getStockColor = (quantity: number) => {
    if (quantity > 50) return "text-green-500";
    if (quantity >= 10) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <Card 
      className={`flex flex-col h-[160px] bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg group rounded-xl overflow-hidden cursor-pointer ${isOutOfStock ? 'opacity-60' : ''}`}
      onClick={handleClick}
    >
      <div className="p-2 flex flex-col gap-1 h-full">
        <div className="h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-lg flex items-center justify-center group-hover:scale-95 transition-transform duration-300 overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="h-6 w-6 text-white/60 group-hover:text-white/80 transition-colors" />
          )}
        </div>
        
        <div className="flex flex-col gap-1 flex-1">
          <h3 className="font-semibold text-xs text-white line-clamp-2 leading-tight">{product.name}</h3>
          {isOutOfStock ? (
            <Badge variant="destructive" className="text-[8px] self-start px-1 py-0">
              <AlertCircle className="h-2 w-2 mr-0.5" />
              Rupture
            </Badge>
          ) : (
            <Badge variant="secondary" className={`text-[8px] self-start px-1 py-0 ${getStockColor(effectiveStock)}`}>
              Stock: {effectiveStock}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
          <span className="text-xs font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent truncate">
            {formatGNF(product.price)}
          </span>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 transition-colors h-6 w-6 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) {
                onAddToCart(product);
              }
            }}
            disabled={isOutOfStock}
          >
            <Plus className="h-3 w-3 text-white" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
