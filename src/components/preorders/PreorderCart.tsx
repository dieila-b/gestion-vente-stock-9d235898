
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CartItem } from '@/types/pos';
import { formatGNF } from '@/lib/currency';
import { Client } from '@/types/client_unified';

export interface PreorderCartProps {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onUpdateDiscount?: (id: string, discount: number) => void; // Added missing prop
  onSubmit: () => Promise<void>;
  onNotesChange: (notes: string) => void;
  notes: string;
  client: Client | null;
  subtotal: number;
  discount: number;
  total: number;
  clearCart: () => void;
  isLoading?: boolean;
}

export const PreorderCart: React.FC<PreorderCartProps> = ({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateDiscount,
  onSubmit,
  onNotesChange,
  notes,
  client,
  subtotal,
  discount,
  total,
  clearCart,
  isLoading = false,
}) => {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Précommande</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-lg">
            <p className="text-muted-foreground">Aucun produit sélectionné</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[400px] overflow-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatGNF(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-medium">{formatGNF(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={!onUpdateQuantity}
                      >
                        -
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={!onUpdateQuantity}
                      >
                        +
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{formatGNF(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Remise:</span>
                  <span>-{formatGNF(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{formatGNF(total)}</span>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium mb-1">
                Notes
              </label>
              <Textarea
                id="notes"
                placeholder="Ajouter des notes sur la précommande..."
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 p-0 pt-4">
        <Button
          className="w-full"
          disabled={items.length === 0 || !client || isLoading}
          onClick={onSubmit}
        >
          {isLoading ? "Création en cours..." : "Créer la précommande"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          disabled={items.length === 0 || isLoading}
          onClick={clearCart}
        >
          Vider
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PreorderCart;
