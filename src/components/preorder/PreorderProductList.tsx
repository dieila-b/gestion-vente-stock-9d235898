
import React, { useState } from 'react';
import { CartItem } from '@/types/pos';
import { useCatalog, CatalogItem } from '@/hooks/use-catalog';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2 
} from "lucide-react";
import { formatGNF } from "@/lib/currency";

interface PreorderProductListProps {
  cart: CartItem[];
  addToCart: (product: CatalogItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateDiscount?: (id: string, discount: number) => void;
}

export const PreorderProductList: React.FC<PreorderProductListProps> = ({ 
  cart, 
  addToCart, 
  updateQuantity, 
  removeFromCart,
  updateDiscount 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { catalog, isLoading } = useCatalog();
  
  const filteredProducts = catalog.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.reference && product.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const discountedPrice = item.price - (item.discount || 0);
      return total + (discountedPrice * item.quantity);
    }, 0);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Produits de la Précommande</CardTitle>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ajouter Produit
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Sélectionner un produit</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {isLoading ? (
                  <p>Chargement des produits...</p>
                ) : (
                  <div className="grid gap-2 max-h-[70vh] overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => addToCart(product)}
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.reference && `Réf: ${product.reference}`}
                            {product.category && ` | ${product.category}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatGNF(product.price)}</p>
                          <p className="text-sm text-muted-foreground">
                            Stock: {product.stock || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className="text-center py-4">Aucun produit trouvé</p>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto pb-0">
        {cart.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead className="text-center">Quantité</TableHead>
                {updateDiscount && (
                  <TableHead className="text-right">Remise</TableHead>
                )}
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.map((item) => {
                const discountedPrice = item.price - (item.discount || 0);
                const total = discountedPrice * item.quantity;
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.reference && `Réf: ${item.reference}`}
                          {item.category && ` | ${item.category}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatGNF(item.price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-2 w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    {updateDiscount && (
                      <TableCell className="text-right">
                        <Input 
                          type="number"
                          value={item.discount || 0}
                          onChange={(e) => updateDiscount(item.id, Number(e.target.value))}
                          className="w-20 ml-auto text-right"
                        />
                      </TableCell>
                    )}
                    <TableCell className="text-right font-medium">
                      {formatGNF(total)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Votre panier est vide</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4 mt-4">
        <div className="ml-auto text-right">
          <div className="flex justify-between mb-2">
            <Label className="mr-4">Total:</Label>
            <span className="font-bold">{formatGNF(calculateTotal())}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PreorderProductList;
