
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Supplier } from "@/types/supplier";
import type { SupplierOrderProduct } from "@/types/supplierOrder";
import { SupplierFormHeader } from "./forms/SupplierFormHeader";
import { ProductListForm } from "./forms/ProductListForm";
import { FormNotes } from "./forms/FormNotes";
import { FormActions } from "./forms/FormActions";

interface PriceRequestFormProps {
  supplier: Supplier;
  onClose: () => void;
}

export const PriceRequestForm = ({ supplier, onClose }: PriceRequestFormProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Partial<SupplierOrderProduct>[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProduct = () => {
    const newProduct: Partial<SupplierOrderProduct> = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      quantity: 1,
      category: "",
      reference: "",
      priceRequested: true,
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };
    setProducts(updatedProducts);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (products.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit à la demande.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the supplier order using Supabase directly
      const { data: orderData, error: orderError } = await supabase
        .from('supplier_orders')
        .insert({
          supplier_id: supplier.id,
          order_number: `PRQ-${Date.now()}`,
          status: "price_request",
          notes,
          is_price_request: true,
          delivery_address: supplier.address,
        })
        .select()
        .single();

      if (orderError || !orderData) {
        throw new Error("Failed to create supplier order");
      }

      // Add products using Supabase directly
      const { error: productsError } = await supabase
        .from('supplier_order_products')
        .insert(
          products.map(product => ({
            order_id: orderData.id,
            name: product.name,
            quantity: product.quantity,
            category: product.category,
            reference: product.reference,
            price_requested: true,
            status: "pending",
          }))
        );

      if (productsError) {
        throw new Error("Failed to add products to order");
      }

      toast({
        title: "Demande envoyée",
        description: "La demande de prix a été envoyée au fournisseur.",
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de la demande de prix:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la demande de prix.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <Card className="neo-blur border-white/10">
        <SupplierFormHeader type="price-request" supplierName={supplier.name} />
        <CardContent className="space-y-6">
          <ProductListForm
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onRemoveProduct={handleRemoveProduct}
            isPriceRequest
          />
          <FormNotes value={notes} onChange={setNotes} />
          <FormActions
            onClose={onClose}
            isSubmitting={isSubmitting}
            submitLabel="Envoyer la demande"
          />
        </CardContent>
      </Card>
    </form>
  );
};
