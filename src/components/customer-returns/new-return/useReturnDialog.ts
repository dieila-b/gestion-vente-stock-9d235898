import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { unwrapSupabaseObject, transformSupabaseResponse } from "@/utils/supabase-helpers";

// Schéma de validation pour le formulaire de retour
const returnSchema = z.object({
  client_id: z.string().min(1, "Le client est requis"),
  invoice_id: z.string().min(1, "La facture est requise"),
  reason: z.string().min(1, "La raison du retour est requise"),
  notes: z.string().optional(),
  return_date: z.string().min(1, "La date de retour est requise"),
  items: z.array(
    z.object({
      product_id: z.string().min(1, "Le produit est requis"),
      quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
      original_quantity: z.number().optional(),
      price: z.number().optional(),
    })
  ).min(1, "Au moins un article doit être ajouté"),
});

export type ReturnFormValues = z.infer<typeof returnSchema>;

export const useReturnDialog = () => {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      client_id: "",
      invoice_id: "",
      reason: "",
      notes: "",
      return_date: new Date().toISOString().split("T")[0],
      items: [],
    },
  });

  // Charger les clients
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, contact_name, company_name")
        .order("company_name", { ascending: true });

      if (error) {
        console.error("Error fetching clients:", error);
        toast.error("Erreur lors du chargement des clients");
        return;
      }

      setClients(data || []);
    };

    fetchClients();
  }, []);

  // Charger les factures lorsqu'un client est sélectionné
  const handleClientChange = async (clientId: string) => {
    form.setValue("client_id", clientId);
    form.setValue("invoice_id", "");
    setInvoiceItems([]);
    setSelectedItems([]);

    if (!clientId) {
      setInvoices([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, final_total")
        .eq("client_id", clientId)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Erreur lors du chargement des factures");
        return;
      }

      setInvoices(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les articles de la facture sélectionnée
  const handleInvoiceChange = async (invoiceId: string) => {
    form.setValue("invoice_id", invoiceId);
    setSelectedItems([]);

    if (!invoiceId) {
      setInvoiceItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          id, 
          product_id, 
          quantity, 
          price,
          product:catalog(
            id, 
            name
          )
        `)
        .eq("order_id", invoiceId);

      if (error) {
        console.error("Error fetching invoice items:", error);
        toast.error("Erreur lors du chargement des articles");
        return;
      }

      // Transformer les résultats
      const formattedItems = data.map(item => {
        const productObj = unwrapSupabaseObject(item.product);
        return {
          id: item.id,
          product_id: item.product_id,
          productName: productObj?.name || 'Produit inconnu',
          quantity: item.quantity,
          price: item.price,
          original_quantity: item.quantity,
        };
      });

      setInvoiceItems(formattedItems || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un article au retour
  const addItemToReturn = (item: any, quantity: number) => {
    if (quantity <= 0 || quantity > item.original_quantity) {
      toast.error("Quantité invalide");
      return;
    }

    // Vérifier si l'article est déjà dans la liste
    const existingItemIndex = selectedItems.findIndex(
      (i) => i.product_id === item.product_id
    );

    if (existingItemIndex >= 0) {
      // Mettre à jour la quantité si l'article existe déjà
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity = quantity;
      setSelectedItems(updatedItems);
    } else {
      // Ajouter un nouvel article
      setSelectedItems([
        ...selectedItems,
        {
          product_id: item.product_id,
          productName: item.productName,
          quantity: quantity,
          original_quantity: item.original_quantity,
          price: item.price,
        },
      ]);
    }

    // Mettre à jour le formulaire
    form.setValue(
      "items",
      selectedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        original_quantity: item.original_quantity,
        price: item.price,
      }))
    );
  };

  // Supprimer un article du retour
  const removeItemFromReturn = (productId: string) => {
    const updatedItems = selectedItems.filter(
      (item) => item.product_id !== productId
    );
    setSelectedItems(updatedItems);

    // Mettre à jour le formulaire
    form.setValue(
      "items",
      updatedItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        original_quantity: item.original_quantity,
        price: item.price,
      }))
    );
  };

  // Soumettre le formulaire
  const onSubmit = async (data: ReturnFormValues) => {
    setIsSubmitting(true);
    try {
      // Calculer le montant total du retour
      const totalAmount = data.items.reduce((total, item) => {
        const foundItem = invoiceItems.find(
          (i) => i.product_id === item.product_id
        );
        return total + (foundItem?.price || 0) * item.quantity;
      }, 0);

      // Créer le retour
      const { data: returnData, error: returnError } = await supabase
        .from("customer_returns")
        .insert({
          client_id: data.client_id,
          invoice_id: data.invoice_id,
          return_date: data.return_date,
          reason: data.reason,
          notes: data.notes,
          total_amount: totalAmount,
          status: "pending",
          return_number: `RET-${Date.now().toString().slice(-6)}`,
        })
        .select()
        .single();

      if (returnError) {
        console.error("Error creating return:", returnError);
        toast.error("Erreur lors de la création du retour");
        return;
      }

      // Ajouter les articles du retour
      const returnItems = data.items.map((item) => ({
        return_id: returnData.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("customer_return_items")
        .insert(returnItems);

      if (itemsError) {
        console.error("Error adding return items:", itemsError);
        toast.error("Erreur lors de l'ajout des articles du retour");
        return;
      }

      toast.success("Retour créé avec succès");
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    form.reset({
      client_id: "",
      invoice_id: "",
      reason: "",
      notes: "",
      return_date: new Date().toISOString().split("T")[0],
      items: [],
    });
    setInvoices([]);
    setInvoiceItems([]);
    setSelectedItems([]);
  };

  return {
    open,
    setOpen,
    form,
    clients,
    invoices,
    invoiceItems,
    selectedItems,
    isLoading,
    isSubmitting,
    handleClientChange,
    handleInvoiceChange,
    addItemToReturn,
    removeItemFromReturn,
    onSubmit,
    resetForm,
  };
};
