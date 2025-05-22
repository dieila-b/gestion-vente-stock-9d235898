
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { StockEntryForm } from "@/hooks/stocks/useStockMovementTypes";

interface ProductSelectProps {
  form: UseFormReturn<StockEntryForm>;
  products: { id: string; name: string; reference?: string; price: number; }[];
  disabled?: boolean;
}

export function ProductSelect({ form, products, disabled = false }: ProductSelectProps) {
  return (
    <FormField
      control={form.control}
      name="productId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Produit</FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                const selectedProduct = products.find(p => p.id === value);
                if (selectedProduct) {
                  form.setValue('price', selectedProduct.price);
                }
              }}
              defaultValue={field.value}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} {product.reference ? `(${product.reference})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
