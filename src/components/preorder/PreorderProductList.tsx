
import React, { useState } from 'react';
import { useCatalog } from '@/hooks/use-catalog';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface PreorderProductListProps {
  onAddToCart: (product: any, quantity?: number) => void;
}

export const PreorderProductList: React.FC<PreorderProductListProps> = ({
  onAddToCart,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { products, isLoading } = useCatalog();

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.reference &&
        product.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category &&
        product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Produits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)] mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border rounded-md">
                  <Skeleton className="h-5 w-3/5 mb-2" />
                  <Skeleton className="h-4 w-2/5 mb-1" />
                  <div className="flex justify-between mt-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun produit trouvé
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  <div className="flex justify-between items-center p-3 hover:bg-muted/50 rounded-md">
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        {product.reference && <span>Réf: {product.reference}</span>}
                        {product.category && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{product.category}</span>
                          </>
                        )}
                      </div>
                      <div className="text-sm font-medium mt-1">
                        {product.price.toLocaleString('fr-FR')} GNF
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAddToCart(product)}
                      className="h-9 w-9"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PreorderProductList;
