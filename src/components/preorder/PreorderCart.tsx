
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartItem } from '@/types/pos';
import { Trash2, Minus, Plus } from 'lucide-react';

interface PreorderCartProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onValidate: () => Promise<void>;
  isSubmitting: boolean;
}

export const PreorderCart = ({ 
  cart, 
  onUpdateQuantity, 
  onRemoveItem,
  onValidate,
  isSubmitting
}: PreorderCartProps) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      onUpdateQuantity(id, quantity);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Panier</CardTitle>
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun produit dans le panier
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-md">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="text-sm text-muted-foreground">
                    {item.reference ? `Réf: ${item.reference}` : ''}
                    {item.category ? (item.reference ? ` | ${item.category}` : item.category) : ''}
                  </div>
                  <div className="font-bold mt-1">{item.price} DH</div>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1 || isSubmitting}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="w-16 mx-2 text-center"
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemoveItem(item.id)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {cart.length > 0 && (
        <CardFooter className="flex-col">
          <div className="w-full flex justify-between py-4 border-t">
            <span className="font-bold">Total:</span>
            <span className="font-bold">{subtotal.toFixed(2)} DH</span>
          </div>
          <Button 
            className="w-full" 
            size="lg"
            onClick={onValidate}
            disabled={cart.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Valider la précommande'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
