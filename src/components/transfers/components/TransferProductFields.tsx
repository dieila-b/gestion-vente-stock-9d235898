
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { TransferFormValues } from "../schemas/transfer-form-schema";
import { useToast } from "@/hooks/use-toast";

interface TransferProductFieldsProps {
  form: UseFormReturn<TransferFormValues>;
  products: any[];
  availableQuantity: number | null;
}

export const TransferProductFields = ({
  form,
  products,
  availableQuantity,
}: TransferProductFieldsProps) => {
  const { toast } = useToast();

  return (
    <>
      <FormField
        control={form.control}
        name="product_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Article</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="glass-effect">
                  <SelectValue placeholder="Sélectionnez l'article" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {availableQuantity !== null && (
              <p className="text-sm text-muted-foreground">
                Quantité disponible : {availableQuantity}
              </p>
            )}
          </FormItem>
        )}
      />

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
                className="glass-effect"
                {...field}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (availableQuantity !== null && value > availableQuantity) {
                    toast({
                      title: "Attention",
                      description: `La quantité ne peut pas dépasser ${availableQuantity}`,
                      variant: "destructive",
                    });
                    return;
                  }
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
