
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
      // Only include fields that exist in the database
      const result = await db.insert('suppliers', {
        name: values.name,
        contact: values.contact,
        email: values.email,
        phone: values.phone,
        address: values.address,
        website: values.website,
        status: values.status,
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
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du fournisseur.",
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
