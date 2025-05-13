
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { formatGNF } from "@/lib/currency";
import { StockMovementsPrintDialog } from "@/components/stocks/StockMovementsPrintDialog";

const stockEntrySchema = z.object({
  warehouseId: z.string().min(1, "Le dépôt est requis"),
  productId: z.string().min(1, "Le produit est requis"),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  reason: z.string().min(1, "Le motif est requis")
});

type StockEntryForm = z.infer<typeof stockEntrySchema>;

interface StockMovement {
  id: string;
  product: {
    id: string;
    name: string;
    reference: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  pos_location: {
    id: string;
    name: string;
  } | null | undefined;
  quantity: number;
  unit_price: number;
  total_value: number;
  reason: string;
  type: "in" | "out";
  created_at: string;
}

export default function StockIn() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<StockEntryForm>({
    resolver: zodResolver(stockEntrySchema),
    defaultValues: {
      quantity: 1,
      unitPrice: 0,
      reason: ""
    }
  });

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stock-movements', 'in'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_stock_movements')
        .select(`
          id,
          quantity,
          unit_price,
          total_value,
          reason,
          type,
          created_at,
          product:product_id (
            id,
            name,
            reference
          ),
          warehouse:warehouse_id (
            id,
            name
          ),
          pos_location:pos_location_id (
            id,
            name
          )
        `)
        .eq('type', 'in')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des mouvements:', error);
        throw error;
      }

      return (data || []) as unknown as StockMovement[];
    }
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('status', 'Actif');

      if (error) throw error;
      return data;
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('id, name, reference')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const onSubmit = async (data: StockEntryForm) => {
    try {
      console.log("Submitting stock entry:", data);
      
      // Calculate total value
      const totalValue = data.quantity * data.unitPrice;
      
      // Create the stock movement entry
      const { data: movementData, error: movementError } = await supabase
        .from('warehouse_stock_movements')
        .insert({
          warehouse_id: data.warehouseId,
          product_id: data.productId,
          quantity: data.quantity,
          unit_price: data.unitPrice,
          total_value: totalValue,
          reason: data.reason,
          type: 'in'
        })
        .select();

      if (movementError) {
        console.error("Error creating movement:", movementError);
        throw movementError;
      }
      
      console.log("Movement created successfully:", movementData);

      // Update warehouse stock quantities
      const { data: existingStock, error: stockQueryError } = await supabase
        .from('warehouse_stock')
        .select('id, quantity, unit_price')
        .eq('warehouse_id', data.warehouseId)
        .eq('product_id', data.productId)
        .maybeSingle();

      if (stockQueryError) {
        console.error("Error querying existing stock:", stockQueryError);
        throw stockQueryError;
      }

      if (existingStock) {
        // Update existing stock
        const newQuantity = existingStock.quantity + data.quantity;
        const newTotalValue = newQuantity * existingStock.unit_price;
        
        console.log("Updating existing stock:", {
          id: existingStock.id,
          newQuantity,
          newTotalValue
        });
        
        const { error: updateError } = await supabase
          .from('warehouse_stock')
          .update({
            quantity: newQuantity,
            total_value: newTotalValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStock.id);

        if (updateError) {
          console.error("Error updating stock:", updateError);
          throw updateError;
        }
      } else {
        // Insert new stock record
        console.log("Creating new stock record for product in warehouse");
        
        const { error: insertError } = await supabase
          .from('warehouse_stock')
          .insert({
            warehouse_id: data.warehouseId,
            product_id: data.productId,
            quantity: data.quantity,
            unit_price: data.unitPrice,
            total_value: data.quantity * data.unitPrice
          });

        if (insertError) {
          console.error("Error inserting new stock:", insertError);
          throw insertError;
        }
      }

      toast.success("Entrée de stock enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: ['stock-movements', 'in'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      
      // Reset form and close dialog
      form.reset();
      setDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast.error("Erreur lors de l'enregistrement de l'entrée");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Entrées Stock</h1>
          <p className="text-muted-foreground mt-2">
            Historique des entrées de stock
          </p>
        </div>
        <div className="flex gap-4">
          <StockMovementsPrintDialog movements={movements} type="in" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="enhanced-glass">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouvelle Entrée de Stock</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="warehouseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dépôt</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un dépôt" />
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
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produit</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un produit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({product.reference})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix unitaire (GNF)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motif</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    Enregistrer l'entrée
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="enhanced-glass p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gradient">Liste des Entrées</h2>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Emplacement</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Valeur totale</TableHead>
                  <TableHead>Motif</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      Chargement des données...
                    </TableCell>
                  </TableRow>
                ) : movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      Aucune entrée trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {format(new Date(movement.created_at), 'Pp', { locale: fr })}
                      </TableCell>
                      <TableCell>{movement.product.name}</TableCell>
                      <TableCell>{movement.product.reference}</TableCell>
                      <TableCell>
                        {movement.warehouse.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ArrowUp className="w-4 h-4 text-green-500" />
                          <span>Entrée</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{movement.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatGNF(movement.unit_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatGNF(movement.total_value)}
                      </TableCell>
                      <TableCell>{movement.reason}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}
