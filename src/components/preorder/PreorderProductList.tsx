
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCatalog } from '@/hooks/use-catalog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Product } from '@/types/pos';

interface PreorderProductListProps {
  addToCart: (product: Product, quantity?: number) => void;
}

export function PreorderProductList({ addToCart }: PreorderProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { products, isLoading } = useCatalog();
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.reference && product.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un produit"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">Chargement des produits...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun produit trouvé
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between items-center p-4 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {product.reference && <span>Réf: {product.reference}</span>}
                    {product.category && (
                      <span className="ml-2">Catégorie: {product.category}</span>
                    )}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    {product.price.toLocaleString()} GNF
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addToCart(product)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
