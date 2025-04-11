
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CartItem } from '@/types/pos';
import { X, Trash } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PreorderCartProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function PreorderCart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  notes,
  onNotesChange
}: PreorderCartProps) {
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Panier</CardTitle>
        {cart.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearCart}>
            <Trash className="h-4 w-4 mr-2" />
            Vider
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Le panier est vide
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.price.toLocaleString()} GNF
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 h-8"
                  />
                  <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{calculateTotal().toLocaleString()} GNF</span>
              </div>
            </div>

            <div className="pt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes supplémentaires (facultatif)"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
