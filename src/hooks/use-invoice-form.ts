
import { useState } from "react";
import { db } from "@/utils/db-adapter";
import { CatalogProduct } from "@/types/catalog";
import { toast } from "sonner";

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
  posLocationId?: string;
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
    discount: "0",
    posLocationId: ""
  });

  function generateInvoiceNumber() {
    const prefix = "INV";
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}${month}-${random}`;
  }

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
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, quantity: Math.max(1, quantity) }
        : p
    ));
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
  };

  const handleSubmitInvoice = async () => {
    try {
      const subtotal = selectedProducts.reduce((total, product) => {
        return total + (product.price * product.quantity);
      }, 0);

      const totalDiscount = selectedProducts.reduce((total, product) => {
        return total + (product.discount || 0);
      }, 0);

      const finalAmount = subtotal - totalDiscount;

      // Use the db adapter to insert into the invoices table
      const invoice = await db.insert('invoices', {
        invoice_number: formData.invoiceNumber,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        amount: finalAmount,
        description: formData.description,
        vat_rate: parseFloat(formData.vatRate),
        signature: formData.signature,
        discount: totalDiscount,
        payment_status: 'pending',
        remaining_amount: finalAmount,
        pos_location_id: formData.posLocationId || null
      });

      if (!invoice) {
        throw new Error("Failed to create invoice");
      }

      // Insert invoice items
      const invoiceItems = selectedProducts.map(product => ({
        invoice_id: invoice.id,
        product_id: product.id,
        quantity: product.quantity,
        price: product.price,
        discount: product.discount
      }));

      // Use the db adapter to insert invoice items
      const itemsResult = await db.insert('invoice_items', invoiceItems);

      if (!itemsResult) {
        throw new Error("Failed to create invoice items");
      }

      toast.success("Facture créée avec succès");
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error("Erreur lors de la création de la facture");
      return null;
    }
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
    handlePosLocationChange: (value: string) => {
      setFormData(prev => ({
        ...prev,
        posLocationId: value
      }));
    }
  };
}
