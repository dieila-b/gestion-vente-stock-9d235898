
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supplierFormSchema, SupplierFormValues } from "../forms/SupplierFormSchema";
import { Supplier } from "@/types/supplier";
import { useEffect } from "react";
import { db } from "@/utils/db-adapter";

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
      status: "En attente" as "En attente" | "Actif" | "Inactif",
      country: "",
      city: "",
      postal_box: "",
      landline: "",
    },
  });

  // Initialize form with supplier data
  useEffect(() => {
    if (supplier) {
      // Ensure the status is cast to the expected enum values
      const supplierStatus = supplier.status || "En attente";
      const validStatus: "En attente" | "Actif" | "Inactif" = 
        supplierStatus === "Actif" ? "Actif" :
        supplierStatus === "Inactif" ? "Inactif" : "En attente";

      form.reset({
        name: supplier.name || "",
        contact: supplier.contact || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        website: supplier.website || "",
        status: validStatus,
        country: supplier.country || "",
        city: supplier.city || "",
        postal_box: supplier.postal_box || "",
        landline: supplier.landline || "",
      });
    }
  }, [supplier, form]);

  const updateSupplierMutation = useMutation({
    mutationFn: async (values: SupplierFormValues) => {
      // Only update fields that exist in the database
      const result = await db.update('suppliers', {
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
      }, 'id', supplier.id);

      if (!result) {
        throw new Error("Failed to update supplier");
      }
      
      return result;
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
