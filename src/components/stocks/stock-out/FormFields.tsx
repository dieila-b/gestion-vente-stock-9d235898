
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { StockEntryForm } from "@/hooks/stocks/useStockMovementTypes";

interface WarehouseSelectProps {
  form: UseFormReturn<StockEntryForm>;
  warehouses: { id: string; name: string; }[];
}

export function WarehouseSelect({ form, warehouses }: WarehouseSelectProps) {
  return (
    <FormField
      control={form.control}
      name="warehouseId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Entrepôt</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un entrepôt" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface ProductSelectProps {
  form: UseFormReturn<StockEntryForm>;
  products: { id: string; name: string; reference?: string; price: number; }[];
}

export function ProductSelect({ form, products }: ProductSelectProps) {
  return (
    <FormField
      control={form.control}
      name="productId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Produit</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} {product.reference ? `(${product.reference})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface QuantityInputProps {
  form: UseFormReturn<StockEntryForm>;
}

export function QuantityInput({ form }: QuantityInputProps) {
  return (
    <FormField
      control={form.control}
      name="quantity"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Quantité</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              min="1" 
              {...field}
              onChange={e => field.onChange(parseInt(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface PriceInputProps {
  form: UseFormReturn<StockEntryForm>;
}

export function PriceInput({ form }: PriceInputProps) {
  return (
    <FormField
      control={form.control}
      name="unitPrice"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Prix unitaire</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              min="0" 
              step="0.01"
              {...field}
              onChange={e => field.onChange(parseFloat(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface ReasonInputProps {
  form: UseFormReturn<StockEntryForm>;
}

export function ReasonInput({ form }: ReasonInputProps) {
  return (
    <FormField
      control={form.control}
      name="reason"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Motif</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Veuillez indiquer le motif de la sortie"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
