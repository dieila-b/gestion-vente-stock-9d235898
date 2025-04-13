
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supplierFormSchema, SupplierFormValues, defaultSupplierValues } from "../forms/SupplierFormSchema";
import { db } from "@/utils/db-adapter";

interface UseSupplierFormProps {
  onSuccess: () => void;
}

export const useSupplierForm = ({ onSuccess }: UseSupplierFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: defaultSupplierValues,
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (values: SupplierFormValues) => {
      try {
        // Only include fields that exist in the database
        const result = await db.insert('suppliers', {
          name: values.name,
          contact: values.contact,
          email: values.email,
          phone: values.phone,
          address: values.address,
          website: values.website,
          status: values.status,
          country: values.country,
          city: values.city,
          postal_box: values.postal_box,
          landline: values.landline,
          product_categories: [],
          verified: false,
          products_count: 0,
          orders_count: 0,
          reliability: 0,
          rating: 0,
          performance_score: 0,
          quality_score: 0,
          delivery_score: 0,
          pending_orders: 0,
          total_revenue: 0,
        });

        if (!result) {
          throw new Error("Failed to create supplier");
        }
        
        return result;
      } catch (error) {
        console.error("Error inserting supplier:", error);
        // If we get a "relation does not exist" error, it means the table doesn't exist
        if (error instanceof Error && 
            error.message.includes("relation") && 
            error.message.includes("does not exist")) {
          throw new Error("La table des fournisseurs n'existe pas. Veuillez la créer d'abord.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Fournisseur ajouté avec succès",
        description: "Le nouveau fournisseur est en attente de validation.",
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout du fournisseur:", error);
      let errorMessage = "Une erreur est survenue lors de l'ajout du fournisseur.";
      
      if (error instanceof Error) {
        if (error.message.includes("La table des fournisseurs n'existe pas")) {
          errorMessage = "La base de données n'est pas correctement configurée. La table des fournisseurs n'existe pas.";
        }
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: SupplierFormValues) => {
    createSupplierMutation.mutate(values);
  };

  return {
    form,
    onSubmit,
    isPending: createSupplierMutation.isPending
  };
};
