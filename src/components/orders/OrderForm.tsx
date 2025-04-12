
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CartItem } from "@/types/CartState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatGNF } from "@/lib/currency";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface OrderFormProps {
  onAddToCart: (item: CartItem) => void;
  isLoading: boolean;
}

export function OrderForm({ onAddToCart, isLoading }: OrderFormProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch products from the catalog
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Filter products based on search query
  const filteredProducts = searchQuery 
    ? products.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.reference?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  // Add product to cart
  const handleAddToCart = (product: any) => {
    const cartItem: CartItem = {
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      subtotal: product.price,
      discount: 0,
      category: product.category || '',
    };
    
    onAddToCart(cartItem);
  };

  return (
    <Card className="rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Ajouter des produits</h2>
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
          {isLoadingProducts ? (
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
                    onClick={() => handleAddToCart(product)}
                    disabled={isLoading}
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
