
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { supplierFormSchema, SupplierFormValues, defaultSupplierValues } from "../forms/SupplierFormSchema";

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

  // Generate a supplier code
  const generateSupplierCode = async (): Promise<string> => {
    // Get current date for code generation
    const today = new Date();
    const year = today.getFullYear().toString().slice(2); // Get last 2 digits of year
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of existing suppliers for sequential numbering
    const { count, error } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Error getting suppliers count:", error);
      return `FOUR-${year}${month}-0001`;
    }
    
    // Format sequential number with leading zeros
    const sequentialNumber = ((count || 0) + 1).toString().padStart(4, '0');
    
    return `FOUR-${year}${month}-${sequentialNumber}`;
  };

  const createSupplierMutation = useMutation({
    mutationFn: async (values: SupplierFormValues) => {
      const supplierCode = await generateSupplierCode();
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
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
          supplier_code: supplierCode,
          country: values.country,
          city: values.city,
          postal_box: values.postal_box,
          landline: values.landline
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
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
