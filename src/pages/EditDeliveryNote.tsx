
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const EditDeliveryNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm();

  const { data: deliveryNote, isLoading } = useQuery({
    queryKey: ['delivery-note', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_notes')
        .select(`
          *,
          items:delivery_note_items (
            id,
            product_id,
            quantity_ordered,
            quantity_received,
            unit_price,
            product:catalog!delivery_note_items_product_id_fkey (
              name,
              reference
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('delivery_notes')
        .update({
          notes: data.notes
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Modifications enregistrées",
        description: "Le bon de livraison a été mis à jour avec succès"
      });

      navigate('/delivery-notes');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4">Chargement...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/delivery-notes')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold">
              Modifier le bon de livraison #{deliveryNote?.delivery_number}
            </h1>
          </div>
        </div>

        <div className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="delivery_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de bon de livraison</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={deliveryNote?.delivery_number}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Articles</h3>
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Produit</th>
                        <th className="px-4 py-2 text-left">Référence</th>
                        <th className="px-4 py-2 text-left">Qté commandée</th>
                        <th className="px-4 py-2 text-left">Qté reçue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveryNote?.items?.map((item: any) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-2">{item.product.name}</td>
                          <td className="px-4 py-2">{item.product.reference}</td>
                          <td className="px-4 py-2">{item.quantity_ordered}</td>
                          <td className="px-4 py-2">{item.quantity_received}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          defaultValue={deliveryNote?.notes}
                          placeholder="Ajoutez des notes ou commentaires..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/delivery-notes')}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditDeliveryNote;
