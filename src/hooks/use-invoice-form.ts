
import { useState } from "react";

export interface InvoiceFormData {
  invoiceNumber: string;
  clientId: string | null;
  clientName: string;
  clientEmail: string;
  amount: string;
  description: string;
  vatRate: string;
  signature: string;
  discount: string;
  posLocationId?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
}

export function useInvoiceForm() {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: `INV-${Date.now()}`,
    clientId: null,
    clientName: '',
    clientEmail: '',
    amount: '',
    description: '',
    vatRate: '20',
    signature: '',
    discount: '0',
    posLocationId: undefined
  });

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const handleInputChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddProduct = (product: Omit<Product, 'quantity' | 'discount'>) => {
    setSelectedProducts(prev => [
      ...prev,
      { ...product, quantity: 1, discount: 0 }
    ]);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, quantity } : p)
    );
  };

  const handleUpdateDiscount = (productId: string, discount: number) => {
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, discount } : p)
    );
  };

  const handleSubmitInvoice = () => {
    console.log("Submit invoice:", { formData, selectedProducts });
  };

  return {
    formData,
    selectedProducts,
    handleInputChange,
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateQuantity,
    handleUpdateDiscount,
    handleSubmitInvoice
  };
}
