
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatGNF } from "@/lib/currency";

interface ProductSelectorProps {
  products: any[];
  isLoading: boolean;
  onAddToCart: (product: any) => void;
}

export function ProductSelector({ 
  products, 
  isLoading, 
  onAddToCart 
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products based on search query
  const filteredProducts = searchQuery 
    ? products.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.reference?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <Card className="rounded-lg shadow-md h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Produits</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher des produits..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-2 text-center p-4">Chargement des produits...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-2 text-center p-4">Aucun produit trouvé</div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="p-3 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.reference || 'No Ref'}</p>
                    <p className="mt-1 font-medium">{formatGNF(product.price)}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => onAddToCart(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
