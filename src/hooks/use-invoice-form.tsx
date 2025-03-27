
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CatalogProduct } from "@/types/catalog";

export interface InvoiceProduct extends CatalogProduct {
  quantity: number;
  discount: number;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: string;
  description: string;
  vatRate: string;
  signature: string;
  discount: string;
}

export function useInvoiceForm() {
  const [selectedProducts, setSelectedProducts] = useState<InvoiceProduct[]>([]);
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: generateInvoiceNumber(),
    clientName: "",
    clientEmail: "",
    amount: "",
    description: "",
    vatRate: "20",
    signature: "",
    discount: "0"
  });

  function generateInvoiceNumber() {
    const prefix = "INV";
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}-${random}`;
  }

  const getSubtotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  const getTotalDiscount = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.discount || 0);
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = (product: CatalogProduct) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === product.id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1, discount: 0 }]);
    }

    updateAmount();
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    updateAmount();
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, quantity: Math.max(1, quantity) }
        : p
    ));
    updateAmount();
  };

  const handleUpdateDiscount = (productId: string, discount: number) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const maxDiscount = p.price * p.quantity;
        return {
          ...p,
          discount: Math.min(Math.max(0, discount), maxDiscount)
        };
      }
      return p;
    }));
    updateAmount();
  };

  const updateAmount = () => {
    const subtotal = getSubtotal();
    const totalDiscount = getTotalDiscount();
    const finalAmount = subtotal - totalDiscount;
    
    setFormData(prev => ({
      ...prev,
      amount: finalAmount.toString(),
      discount: totalDiscount.toString()
    }));
  };

  const handleSubmitInvoice = async () => {
    try {
      const subtotal = getSubtotal();
      const totalDiscount = getTotalDiscount();
      const finalAmount = subtotal - totalDiscount;
      const vatRate = parseFloat(formData.vatRate) || 0;

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: formData.invoiceNumber,
          client_name: formData.clientName,
          client_email: formData.clientEmail,
          amount: finalAmount,
          description: formData.description,
          vat_rate: vatRate,
          discount: totalDiscount,
          signature: formData.signature,
          status: 'draft',
          total_amount: finalAmount,
          remaining_amount: finalAmount,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Facture créée avec succès");
      resetForm();
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error("Erreur lors de la création de la facture");
      return null;
    }
  };

  const resetForm = () => {
    setSelectedProducts([]);
    setFormData({
      invoiceNumber: generateInvoiceNumber(),
      clientName: "",
      clientEmail: "",
      amount: "",
      description: "",
      vatRate: "20",
      signature: "",
      discount: "0"
    });
  };

  return {
    formData,
    selectedProducts,
    handleInputChange,
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateQuantity,
    handleUpdateDiscount,
    handleSubmitInvoice,
    resetForm,
    generateInvoiceNumber
  };
}
