
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { ReturnItem } from "@/types/customer-return";
import { InvoiceItem } from "@/types/customer-return";

interface ManualItemsListProps {
  items: ReturnItem[];
  products: any[];
  invoiceItems: InvoiceItem[];
  onManualProductChange: (index: number, productId: string) => void;
  onRemoveManualProduct: (index: number) => void;
  onAddManualProduct: () => void;
}

export function ManualItemsList({
  items,
  products,
  invoiceItems,
  onManualProductChange,
  onRemoveManualProduct,
  onAddManualProduct
}: ManualItemsListProps) {
  // Get invoice items product names for display
  const getProductName = (productId: string) => {
    const item = invoiceItems.find(item => item.product_id === productId);
    return item ? item.product_name : "Produit inconnu";
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Articles sélectionnés pour le retour</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={onAddManualProduct}
          className="hidden" // Hide this button until manual product selection is implemented
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un article manuel
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
          Aucun article sélectionné pour le retour
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-md">
              <div className="flex-1">
                <p className="font-medium">{getProductName(item.product_id)}</p>
                <p className="text-sm text-muted-foreground">
                  Quantité: {item.quantity}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveManualProduct(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
