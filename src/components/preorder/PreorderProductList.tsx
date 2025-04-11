
import React, { useState } from 'react';
import { useCatalog } from '@/hooks/use-catalog';
import { Product } from '@/types/pos';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';

export interface PreorderProductListProps {
  addToCart: (product: any, quantity?: number) => void;
}

export const PreorderProductList = ({ addToCart }: PreorderProductListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { products, isLoading } = useCatalog();

  const filteredProducts = searchQuery 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.reference && product.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catalogue de produits</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Chargement des produits...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? "Aucun produit trouvé pour cette recherche" : "Aucun produit disponible"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="border rounded-lg overflow-hidden">
                {product.image_url ? (
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
                    Pas d'image
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <div className="text-sm text-gray-500 truncate">
                    {product.reference ? `Réf: ${product.reference}` : ''}
                    {product.category ? (product.reference ? ` | ${product.category}` : product.category) : ''}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">{product.price} DH</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
