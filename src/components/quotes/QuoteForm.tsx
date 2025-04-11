import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CatalogProduct } from "@/types/catalog";
import { supabase } from "@/integrations/supabase/client";
import { generateQuotePDF } from "@/lib/generateQuotePDF";
import { QuoteHeader } from "./form/QuoteHeader";
import { QuoteProducts } from "./form/QuoteProducts";
import { QuoteNotes } from "./form/QuoteNotes";
import { QuoteActions } from "./form/QuoteActions";
import { InvoiceProductModal } from "@/components/invoices/form/InvoiceProductModal";
import { useProducts } from "@/hooks/use-products";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatGNF } from '@/lib/currency';

interface QuoteFormData {
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  validityDate: string;
  notes: string;
  products: Array<{
    product: CatalogProduct;
    quantity: number;
  }>;
}

interface QuoteFormProps {
  formData: QuoteFormData;
  setFormData: (data: QuoteFormData) => void;
  onClose: () => void;
}

export function QuoteForm({ formData, setFormData, onClose }: QuoteFormProps) {
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { products } = useProducts();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateTotal = () => {
    return formData.products.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newProducts = [...formData.products];
    newProducts[index].quantity = quantity;
    setFormData({ ...formData, products: newProducts });
  };

  const handleProductRemove = (index: number) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: newProducts });
  };

  const handleAddProduct = (product: CatalogProduct) => {
    const existingProductIndex = formData.products.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingProductIndex !== -1) {
      const newProducts = [...formData.products];
      newProducts[existingProductIndex].quantity += 1;
      setFormData({ ...formData, products: newProducts });
    } else {
      setFormData({
        ...formData,
        products: [...formData.products, { product, quantity: 1 }]
      });
    }
    setIsProductSelectorOpen(false);
  };

  const handleGeneratePDF = () => {
    try {
      const doc = generateQuotePDF(formData);
      doc.save(`devis-${formData.quoteNumber}.pdf`);
      toast.success("Devis généré avec succès !");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const amount = calculateTotal();
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          client_id: selectedClient,
          issue_date: formatDate(issueDate),
          expiry_date: formatDate(expiryDate),
          total_amount: amount,
          status: 'pending',
          notes: notes
        })
        .select();

      if (error) throw error;

      toast.success("Devis créé avec succès !");
      onClose();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error("Erreur lors de la création du devis");
    }
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.reference.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Card className="enhanced-glass p-8 space-y-6 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <QuoteHeader
          quoteNumber={formData.quoteNumber}
          clientName={formData.clientName}
          clientEmail={formData.clientEmail}
          validityDate={formData.validityDate}
          onChange={handleInputChange}
        />

        <QuoteProducts
          products={formData.products}
          onQuantityChange={handleQuantityChange}
          onProductRemove={handleProductRemove}
          onAddProduct={() => setIsProductSelectorOpen(true)}
        />

        <QuoteNotes
          notes={formData.notes}
          onChange={handleInputChange}
        />

        <QuoteActions
          total={calculateTotal()}
          onSave={handleSubmit}
          onGeneratePDF={handleGeneratePDF}
          onSend={() => toast.info("Envoi par email en cours...")}
        />
      </form>

      <Sheet open={isProductSelectorOpen} onOpenChange={setIsProductSelectorOpen}>
        <SheetContent side="right" className="w-full sm:w-[540px]">
          <SheetHeader className="mb-5">
            <SheetTitle>Sélectionner des produits</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom ou référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg enhanced-glass hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatGNF(product.price)} - Réf: {product.reference}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddProduct(product)}
                    className="enhanced-glass"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}
