
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { formatGNF } from "@/lib/currency";

interface SalesCartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface PreorderCartProps {
  items: SalesCartItem[];
  onRemoveItem: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onSubmit: () => void;
  onNotesChange: (notes: string) => void;
  notes: string;
  isLoading: boolean;
}

export function PreorderCart({
  items,
  onRemoveItem,
  onQuantityChange,
  onSubmit,
  onNotesChange,
  notes,
  isLoading
}: PreorderCartProps) {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <Card className="rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <ShoppingCart className="h-5 w-5" />
          Vente ({items.length})
        </div>
      </div>

      <div className="p-4">
        <ScrollArea className="h-[250px] mb-4">
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                Aucun produit dans le panier
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{formatGNF(item.price)}</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Textarea
            placeholder="Ajouter des notes pour cette vente..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="h-24"
          />
        </div>

        <div className="flex justify-between font-semibold text-lg mb-4">
          <span>Total</span>
          <span>{formatGNF(subtotal)}</span>
        </div>

        <Button 
          className="w-full"
          onClick={onSubmit}
          disabled={items.length === 0 || isLoading}
        >
          {isLoading ? "Traitement..." : "Finaliser la vente"}
        </Button>
      </div>
    </Card>
  );
}
