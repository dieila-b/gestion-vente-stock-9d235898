
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { supplierFormSchema, SupplierFormValues } from "../forms/SupplierFormSchema";
import { Supplier } from "@/types/supplier";
import { useEffect } from "react";

interface UseSupplierEditFormProps {
  onSuccess: () => void;
  supplier: Supplier;
}

export const useSupplierEditForm = ({ onSuccess, supplier }: UseSupplierEditFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      status: "En attente",
      supplier_code: "",
      country: "",
      city: "",
      postal_box: "",
      landline: "",
    },
  });

  // Initialize form with supplier data
  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name || "",
        contact: supplier.contact || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        website: supplier.website || "",
        status: supplier.status || "En attente",
        supplier_code: "",  // This field is read-only
        country: "",  // These fields might not exist in the database
        city: "",
        postal_box: "",
        landline: "",
      });
    }
  }, [supplier, form]);

  const updateSupplierMutation = useMutation({
    mutationFn: async (values: SupplierFormValues) => {
      // Only update fields that exist in the database
      const { data, error } = await supabase
        .from('suppliers')
        .update({
          name: values.name,
          contact: values.contact,
          email: values.email,
          phone: values.phone,
          address: values.address,
          website: values.website,
          status: values.status,
          // Don't update supplier_code or other fields that shouldn't change
        })
        .eq('id', supplier.id)
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la modification du fournisseur:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Fournisseur modifié avec succès",
        description: "Les informations du fournisseur ont été mises à jour.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Erreur lors de la modification du fournisseur:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du fournisseur.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: SupplierFormValues) => {
    updateSupplierMutation.mutate(values);
  };

  return {
    form,
    onSubmit,
    isPending: updateSupplierMutation.isPending
  };
};
