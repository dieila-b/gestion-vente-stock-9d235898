
import React from 'react';
import { CartItem } from '@/types/pos';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PreorderCartProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
}

export const PreorderCart: React.FC<PreorderCartProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateDiscount,
}) => {
  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.quantity * (item.discounted_price || item.price),
      0
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>Panier ({cart.length} articles)</CardTitle>
      </CardHeader>
      <CardContent>
        {cart.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Le panier est vide
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto mb-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col p-3 bg-background rounded-lg border"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Réf: {item.reference || "N/A"} | {item.category || "Non catégorisé"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        className="w-14 h-8 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        {item.discount && item.discount > 0 ? (
                          <>
                            <span className="text-muted-foreground line-through text-xs">
                              {item.price.toLocaleString('fr-FR')} GNF
                            </span>
                            <Badge variant="outline" className="text-xs">
                              -{item.discount}%
                            </Badge>
                          </>
                        ) : null}
                      </div>
                      <span className="font-medium">
                        {((item.discounted_price || item.price) * item.quantity).toLocaleString(
                          'fr-FR'
                        )}{' '}
                        GNF
                      </span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Remise (%)</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={item.discount || 0}
                        onChange={(e) =>
                          onUpdateDiscount(item.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-20 h-7 text-right text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{calculateTotal().toLocaleString('fr-FR')} GNF</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PreorderCart;
