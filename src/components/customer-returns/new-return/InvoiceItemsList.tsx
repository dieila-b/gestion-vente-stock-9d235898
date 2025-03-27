
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { InvoiceItem } from "@/types/customer-return";

interface InvoiceItemsListProps {
  invoiceItems: InvoiceItem[];
  selectedItems: { [key: string]: boolean };
  onItemCheckboxChange: (productId: string, checked: boolean) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  getInvoiceItemQuantity: (productId: string) => number;
}

export function InvoiceItemsList({
  invoiceItems,
  selectedItems,
  onItemCheckboxChange,
  onQuantityChange,
  getItemQuantity,
  getInvoiceItemQuantity
}: InvoiceItemsListProps) {
  if (invoiceItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-4 border rounded-md p-4 bg-secondary/20">
      <h3 className="font-medium">Articles de la facture sélectionnée</h3>
      <div className="space-y-3">
        {invoiceItems.map((item) => (
          <div key={item.product_id} className="flex items-center gap-3 p-2 bg-background rounded">
            <Checkbox
              id={`item-${item.product_id}`}
              checked={!!selectedItems[item.product_id]}
              onCheckedChange={(checked) => onItemCheckboxChange(item.product_id, checked === true)}
            />
            <div className="flex-1">
              <label 
                htmlFor={`item-${item.product_id}`}
                className="font-medium cursor-pointer"
              >
                {item.product_name}
              </label>
              <div className="text-sm text-muted-foreground">
                Quantité disponible: {item.quantity}
              </div>
            </div>
            {selectedItems[item.product_id] && (
              <div className="flex items-center gap-2">
                <Label htmlFor={`quantity-${item.product_id}`} className="text-sm">
                  Qté à retourner:
                </Label>
                <Input
                  id={`quantity-${item.product_id}`}
                  type="number"
                  min="1"
                  max={getInvoiceItemQuantity(item.product_id)}
                  value={getItemQuantity(item.product_id)}
                  onChange={(e) => onQuantityChange(item.product_id, parseInt(e.target.value) || 1)}
                  className="w-20"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
