
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

interface ManualItemsListProps {
  items: { product_id: string; quantity: number }[];
  products: { id: string; name: string }[];
  invoiceItems: any[];
  onManualProductChange: (index: number, field: 'product_id' | 'quantity', value: string | number) => void;
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
  // Filter out items that already exist in the invoice items
  const manualItems = items.filter(
    item => !invoiceItems.some(invoiceItem => invoiceItem.product_id === item.product_id)
  );

  if (manualItems.length === 0) {
    return (
      <div className="flex items-center justify-between">
        <Label>Articles additionnels</Label>
        <Button
          type="button"
          variant="outline"
          onClick={onAddManualProduct}
          size="sm"
          className="h-8"
        >
          Ajouter un article
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Label>Articles additionnels</Label>
        <Button
          type="button"
          variant="outline"
          onClick={onAddManualProduct}
          size="sm"
          className="h-8"
        >
          Ajouter un article
        </Button>
      </div>

      <div className="space-y-4 mt-4 border rounded-md p-4 bg-secondary/20">
        <h3 className="font-medium">Articles additionnels</h3>
        <div className="space-y-3">
          {manualItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={item.product_id}
                onValueChange={(value) => onManualProductChange(index, 'product_id', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onManualProductChange(index, 'quantity', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onRemoveManualProduct(index)}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
