
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStockExits } from '@/hooks/stocks/useStockExits';
import { useStockQuery } from '@/hooks/stocks/useStockQuery';

// Form schema
const formSchema = z.object({
  product: z.string().min(1, { message: "Veuillez sélectionner un produit" }),
  warehouse: z.string().min(1, { message: "Veuillez sélectionner un entrepôt" }),
  quantity: z.number().positive({ message: "La quantité doit être positive" }),
  unitPrice: z.number().nonnegative({ message: "Le prix unitaire ne peut pas être négatif" }),
  reason: z.string().min(3, { message: "Veuillez indiquer un motif valide" }),
});

type FormValues = z.infer<typeof formSchema>;

// Define the product type to include price
interface ProductType {
  id: string;
  name: string;
  reference?: string;
  price?: number;
}

export function StockOutForm({ onClose }: { onClose: () => void }) {
  const { createStockExit, isLoading } = useStockExits();
  const { warehouses, products } = useStockQuery('out');
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: '',
      warehouse: '',
      quantity: 1,
      unitPrice: 0,
      reason: '',
    },
  });

  const onProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId) as ProductType;
    setSelectedProduct(product);
    
    if (product && product.price !== undefined) {
      form.setValue('unitPrice', product.price || 0);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const success = await createStockExit({
        productId: values.product,
        warehouseId: values.warehouse,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        reason: values.reason,
      });
      
      if (success) {
        form.reset();
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product selection */}
        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produit</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  onProductChange(value);
                }} 
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

        {/* Warehouse selection */}
        <FormField
          control={form.control}
          name="warehouse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entrepôt</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
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

        {/* Quantity */}
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unit Price */}
        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix unitaire</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reason */}
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Traitement...' : 'Enregistrer la sortie'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default StockOutForm;
