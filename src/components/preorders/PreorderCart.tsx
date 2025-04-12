
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/CartState";
import { Client } from "@/types/client_unified";
import { Textarea } from "@/components/ui/textarea";
import { formatGNF } from "@/lib/currency";
import { X, Minus, Plus } from "lucide-react";

export interface PreorderCartProps {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onSubmit: () => Promise<void>;
  onNotesChange: (notes: string) => void;
  notes: string;
  isLoading: boolean;
  selectedClient: Client | null;
  onUpdateDiscount: (id: string, discount: number) => void;
  clearCart: () => void;
}

export function PreorderCart({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onSubmit,
  onNotesChange,
  notes,
  isLoading,
  selectedClient,
  onUpdateDiscount,
  clearCart
}: PreorderCartProps) {
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity) - item.discount, 0);
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Précommande</h2>
      
      {items.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground">
          Votre panier est vide
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between border-b pb-3">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatGNF(item.price)} × {item.quantity}
                </div>
                {item.discount > 0 && (
                  <div className="text-sm text-green-600">
                    Remise: {formatGNF(item.discount)}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0"
                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 w-8 p-0"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-destructive"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          <div className="pt-2">
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatGNF(calculateSubtotal())}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Notes additionnelles..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              className="w-1/3"
              onClick={clearCart}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              className="w-2/3"
              onClick={onSubmit}
              disabled={isLoading || items.length === 0 || !selectedClient}
            >
              {isLoading ? "Traitement..." : "Créer la précommande"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
