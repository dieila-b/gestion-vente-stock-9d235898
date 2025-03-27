
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/pos";

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
  onAddToCart?: (product: Product, availableStock: number) => void;
  showOutOfStock?: boolean;
}

export function ProductSelector({ 
  onProductSelect, 
  onAddToCart,
  showOutOfStock = false 
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data;
    }
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!showOutOfStock) {
      return matchesSearch && product.stock > 0;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Rechercher un produit..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Button
            key={product.id}
            variant="outline"
            className={`w-full h-auto aspect-square flex flex-col items-center justify-center p-2 space-y-2 text-center ${
              product.stock === 0 ? 'bg-yellow-500/10' : ''
            }`}
            onClick={() => {
              if (onAddToCart) {
                onAddToCart(product, product.stock);
              } else {
                onProductSelect(product);
              }
            }}
          >
            <span className="font-semibold truncate w-full">{product.name}</span>
            <span className="text-sm text-muted-foreground">
              {product.stock === 0 ? 'En rupture' : `Stock: ${product.stock}`}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
